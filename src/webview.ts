import * as vscode from "vscode";
import generateFileTreeJson from "./fileStructure";
import { saveDocsToFile } from "./saveD";
import { updateSnippet } from "./utils";
import { processJson } from "./PcessDocs";
interface WebviewMessage {
  command: string;
  data: any;
}

interface BlockState {
  id: string;
  content: any;
  lastUpdated: number;
}
let searchCancelToken: vscode.CancellationTokenSource | undefined;
import { searchStringParallel } from "./seacrh";
import { openAndSelectLinesInDocument } from "./PcessDocs";

export default class MyPanel {
  private panel: vscode.WebviewPanel;
  private context: vscode.ExtensionContext;
  private initialData: any; // Store initial data
  private blockStates: Map<string, BlockState> = new Map();

  constructor(context: vscode.ExtensionContext, initialData: any = null) {
    this.context = context;
    this.initialData = initialData; // Save initial data

    this.panel = vscode.window.createWebviewPanel(
      "webview",
      "React",
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        retainContextWhenHidden: true, // Keep the webview content when hidden
      }
    );

    this.setupMessageListener();
    this.render();
  }

  public sendMsgToWebview(command: string, data: any) {
    try {
      this.panel.webview.postMessage({
        command: command,
        data: data,
      });
    } catch (error) {
      console.error("Error sending message to webview:", error);
    }
  }

  private setupMessageListener() {
    // Dispose handler
    this.panel.onDidDispose(
      () => {
        console.log("Webview panel has been closed");
      },
      null,
      this.context.subscriptions
    );

    // Message handler
    this.panel.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
      console.log("Received message:", message);

      try {
        switch (message.command) {
          case "alert":
            await vscode.commands.executeCommand("walkthru.select", this);
            await vscode.window.showInformationMessage(
              JSON.stringify(message.data)
            );
            break;

          case "getStructure":
            const res = generateFileTreeJson();
            this.sendMsgToWebview("fileStructure", res);
            break;

          case "focusEditor":
            await vscode.commands.executeCommand(
              "workbench.action.focusFirstEditorGroup"
            );
            break;

          case "saveDocs":
            console.log("saving docs:", message.data);

            this.initialData = message.data.docs;

            try {
              await saveDocsToFile(message.data.docs);
              await vscode.window.showInformationMessage(
                "Documentation saved successfully"
              );
            } catch (error) {
              console.error("Error saving docs:", error);
              await vscode.window.showErrorMessage(
                "Failed to save documentation"
              );
            }
            break;
          case "update":
            if (message.data?.id) {
              if (!this.blockStates.get(message.data.id)) {
                this.blockStates.set(message.data.id, {
                  id: message.data.id,
                  content: message.data,
                  lastUpdated: Date.now(),
                });
              }
            }
            console.log(
              "State in old block",
              this.blockStates.get(message.data.id)
            );
            const block = await updateSnippet(message.data);
            this.sendMsgToWebview("updatedBlock", block);
            break;
          case "getBlockState":
            if (message.data?.id) {
              const state = this.blockStates.get(message.data.id);
              if (state) {
                this.sendMsgToWebview("blockState", {
                  id: message.data.id,
                  state: state.content,
                });
              }
            }
            break;

          case "removeBlockState":
            if (message.data?.id) {
              this.blockStates.delete(message.data.id);
              console.log(`State removed for block: ${message.data.id}`);
            }
            break;
          case "search":
            if (searchCancelToken) {
              searchCancelToken.cancel();
            }
            searchCancelToken = new vscode.CancellationTokenSource();

            const searchGenerator = searchStringParallel(
              message.text,
              this.panel.webview,
              searchCancelToken.token
            );

            try {
              while (true) {
                const { value: results, done } = await searchGenerator.next();

                if (searchCancelToken.token.isCancellationRequested) {
                  break;
                }

                if (done) {
                  this.panel.webview.postMessage({
                    command: "searchComplete",
                  });
                  break;
                }

                this.panel.webview.postMessage({
                  command: "searchResults",
                  workspace: this.getWorkspaceName(),
                  results: results,
                  isIncremental: true,
                });
              }
            } catch (error) {
              if (!searchCancelToken.token.isCancellationRequested) {
                this.panel.webview.postMessage({
                  command: "searchError",
                  error: error.message,
                });
              }
            }
            break;
          case "openDocs":
            await vscode.commands.executeCommand(
              "workbench.action.focusFirstEditorGroup"
            );
            await openAndSelectLinesInDocument(
              message.data.path,
              message.data.startLine || undefined,
              message.data.endLine || undefined
            );
            break;

          case "ready":
            // When webview signals it's ready, send initial data if available
            if (this.initialData) {
              this.sendMsgToWebview("initialData", this.initialData);
            }
            break;

          default:
            console.log("Unknown command:", message.command);
        }
      } catch (error) {
        console.error("Error handling message:", error);
        vscode.window.showErrorMessage("Error processing webview command");
      }
    });
    this.panel.onDidChangeViewState(async () => {
      const data = await processJson(this.initialData);
      this.updateData(data);
    });

    this.panel.onDidDispose(async () => {
      if (this.initialData && Array.isArray(this.initialData.blocks)) {
        this.initialData.blocks = this.initialData.blocks.map(
          (initialBlock) => {
            const blockState = this.blockStates.get(initialBlock.id);
            const updatedBlock = blockState
              ? { ...initialBlock, ...blockState.content }
              : initialBlock;
            delete updatedBlock["updated"];
            return updatedBlock;
          }
        );
        await saveDocsToFile(this.initialData);
      }
    });
  }

  public getWorkspaceName() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      // Get the name of the first workspace folder
      const workspaceName = workspaceFolders[0].name;
      console.log("Workspace Name:", workspaceName);
      return workspaceName;
    } else {
      console.log("No workspace folder open.");
      return null;
    }
  }

  private render() {
    const scriptSrc = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "web", "dist", "index.js")
    );

    const cssSrc = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "web", "dist", "index.css")
    );
    const image = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "code.png")
    );
    // Convert initial data to a safe string
    const initialDataScript = this.initialData
      ? `<script>
      window.image = "${image}";
      window.initialData = ${JSON.stringify(this.initialData)};</script>`
      : "";

    this.panel.webview.html = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="${cssSrc}" />
                    <link rel="preload" href="${image}" as="image" type="image/png">
                    <title>React App</title>
                </head>
                <body>
                    <noscript>You need to enable JavaScript to run this app.</noscript>
                    <div id="root"></div>
                    ${initialDataScript}
                   <script src="${scriptSrc}"></script>
                </body>
            </html>`;
  }

  // Public method to update data after initialization
  public updateData(data: any) {
    this.initialData = data;
    this.sendMsgToWebview("initialData", data);
  }
}

// import * as vscode from "vscode";
// import generateFileTreeJson from "./fileStructure";
// import { saveDocsToFile } from "./saveD";

// export default class MyPanel {
//   private panel: vscode.WebviewPanel;
//   private context: vscode.ExtensionContext;

//   constructor(context: vscode.ExtensionContext) {
//     this.context = context;
//     this.panel = vscode.window.createWebviewPanel(
//       "webview",
//       "React",
//       vscode.ViewColumn.Two,
//       {
//         enableScripts: true, // Enable JavaScript in the webview
//       }
//     );
//     this.setupMessageListener();
//     this.render(); // Call render method in constructor
//   }

//   public sendMsgToWebview(command: string, data: any) {
//     this.panel.webview.postMessage({
//       command: command,
//       data: data,
//     });
//   }

//   private setupMessageListener() {
//     this.panel.onDidDispose(
//       () => {
//         console.log("Webview panel has been closed");
//       },
//       null,
//       this.context.subscriptions
//     );
//     this.panel.webview.onDidReceiveMessage(async (message: any) => {
//       console.log(message);
//       vscode.window.showInformationMessage(JSON.stringify(message.data));

//       switch (message.command) {
//         case "alert":
//           vscode.commands.executeCommand("walkthru.select");
//           vscode.window.showInformationMessage(JSON.stringify(message.data));
//           break;

//         case "getStructure":
//           let res = generateFileTreeJson();
//           this.sendMsgToWebview("fileStructure", res);
//           break;

//         case "focusEditor":
//           vscode.commands.executeCommand(
//             "workbench.action.focusFirstEditorGroup"
//           );
//           break;

//         case "saveDocs":
//           console.log("saving", message.data, "=====================");
//           try {
//             await saveDocsToFile(message.data.docs);
//           } catch (error) {
//             // Handle error if needed
//             console.error(error);
//           }
//           break;

//         default:
//           console.log("Unknown command:", message.command);
//           break;
//       }
//     });

//     // this.panel.webview.onDidReceiveMessage((message: any) => {
//     //   console.log(message);
//     //   vscode.window.showInformationMessage(JSON.stringify(message.data));
//     //   if (message.command === "alert") {
//     //     vscode.commands.executeCommand("walkthru.select");
//     //     vscode.window.showInformationMessage(JSON.stringify(message.data));
//     //   } else if (message.command === "getStructure") {
//     //     let res = generateFileTreeJson();
//     //     this.sendMsgToWebview("fileStructure", res);
//     //   } else if (message.command === "focusEditor") {
//     //     vscode.commands.executeCommand(
//     //       "workbench.action.focusFirstEditorGroup"
//     //     );
//     //   }
//     // });
//   }

//   private render() {
//     const scriptSrc = this.panel.webview.asWebviewUri(
//       vscode.Uri.joinPath(this.context.extensionUri, "web", "dist", "index.js")
//     );

//     const cssSrc = this.panel.webview.asWebviewUri(
//       vscode.Uri.joinPath(this.context.extensionUri, "web", "dist", "index.css")
//     );

//     this.panel.webview.html = `<!DOCTYPE html>
//       <html lang="en">
//         <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <link rel="stylesheet" href="${cssSrc}" />
//           <title>React App</title>
//         </head>
//         <body>
//           <noscript>You need to enable JavaScript to run this app.</noscript>
//           <div id="root"></div>
//           <script src="${scriptSrc}"></script>
//         </body>
//       </html>`;
//   }
// }

// private async saveState() {
//   const states = this.context.workspaceState.get<{
//     [key: string]: WebviewState;
//   }>("webviewStates", {});
//   states[this.panelId] = {
//     ...this.state,
//     lastUpdated: Date.now(),
//   };
//   await this.context.workspaceState.update("webviewStates", states);
// }
// private async cleanupState() {
//   const states = this.context.workspaceState.get<{
//     [key: string]: WebviewState;
//   }>("webviewStates", {});
//   delete states[this.panelId];
//   await this.context.workspaceState.update("webviewStates", states);
// }

// private loadState(): WebviewState {
//   const states = this.context.workspaceState.get<{
//     [key: string]: WebviewState;
//   }>("webviewStates", {});
//   return (
//     states[this.panelId] || {
//       id: this.panelId,
//       data: this.initialData,
//       lastUpdated: Date.now(),
//     }
//   );
// }
// public async setState(key: string, value: any) {
//   this.state.data = {
//     ...this.state.data,
//     [key]: value,
//   };
//   await this.saveState();

//   // Notify webview of state change
//   this.sendMsgToWebview("stateUpdate", {
//     key,
//     value,
//     state: this.state.data,
//   });
// }

// public getState(key?: string) {
//   if (key) {
//     return this.state.data?.[key];
//   }
//   return this.state.data;
// }
