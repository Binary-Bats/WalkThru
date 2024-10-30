import * as vscode from "vscode";
import generateFileTreeJson from "./fileStructure";
import { saveDocsToFile } from "./saveD";
import { updateSnippet } from "./utils";

interface WebviewMessage {
  command: string;
  data: any;
}

export default class MyPanel {
  private panel: vscode.WebviewPanel;
  private context: vscode.ExtensionContext;
  private initialData: any; // Store initial data

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
            const block = await updateSnippet(message.data);
            this.sendMsgToWebview("updatedBlock", block);

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
  }

  private render() {
    const scriptSrc = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "web", "dist", "index.js")
    );

    const cssSrc = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "web", "dist", "index.css")
    );
    // Convert initial data to a safe string
    const initialDataScript = this.initialData
      ? `<script>window.initialData = ${JSON.stringify(
          this.initialData
        )};</script>`
      : "";

    this.panel.webview.html = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="${cssSrc}" />
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
