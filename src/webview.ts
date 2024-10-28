import * as vscode from "vscode";
import generateFileTreeJson from "./fileStructure";

export default class MyPanel {
  private panel: vscode.WebviewPanel;
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.panel = vscode.window.createWebviewPanel(
      "webview",
      "React",
      vscode.ViewColumn.Two,
      {
        enableScripts: true, // Enable JavaScript in the webview
      }
    );
    this.setupMessageListener();
    this.render(); // Call render method in constructor
  }

  public sendMsgToWebview(command: string, data: any) {
    this.panel.webview.postMessage({
      command: command,
      data: data,
    });
  }

  private setupMessageListener() {
    this.panel.onDidDispose(
      () => {
        console.log("Webview panel has been closed");
      },
      null,
      this.context.subscriptions
    );

    this.panel.webview.onDidReceiveMessage((message: any) => {
      console.log(message);
      vscode.window.showInformationMessage(JSON.stringify(message.data));
      if (message.command === "alert") {
        vscode.commands.executeCommand("walkthru.select");
        vscode.window.showInformationMessage(JSON.stringify(message.data));
      } else if (message.command === "getStructure") {
        let res = generateFileTreeJson();
        this.sendMsgToWebview("fileStructure", res);
      } else if (message.command === "focusEditor") {
        vscode.commands.executeCommand(
          "workbench.action.focusFirstEditorGroup"
        );
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

    this.panel.webview.html = `<!DOCTYPE html>
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
          <script src="${scriptSrc}"></script>
        </body>
      </html>`;
  }
}
