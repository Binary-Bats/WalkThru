import * as vscode from "vscode";
import MyPanel from "./webview";
import MyTreeViewDataProvider from "./treeView";
import generateFileTreeJson from "./fileStructure";
import path from "path";
let myPanel: any;
const fs = require("fs");
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("walkthru.react", () => {
    myPanel = new MyPanel(context);
  });
  new MyTreeViewDataProvider(context);

  const openWalkthru = vscode.commands.registerCommand(
    "walkthru.openWalkthru",
    (element: any) => {
      const filePath: string = path.join(
        vscode.workspace.rootPath as string,
        ".walkthru",
        element.filename
      );
      try {
        const fileContent: string = fs.readFileSync(filePath, "utf-8");
        const walkThruDoc: any = JSON.parse(fileContent);
        new MyPanel(context, walkThruDoc);
      } catch (error) {
        console.error("Error reading walkthru file:", error);
      }
    }
  );

  // this is for selecting text
  const selectText = vscode.commands.registerCommand(
    "walkthru.select",
    (panel) => {
      // Ensure focus is in the editor area
      vscode.commands.executeCommand("workbench.action.focusActiveEditorGroup");

      let timeoutCounter = 0;

      const editor = vscode.window.visibleTextEditors.filter(
        (editor) => editor.viewColumn === 1
      )[0];
      if (editor) {
        // clearInterval(interval); // Stop the interval once the editor is found
        console.log("log Editor", editor);
        const selection = editor.selection;
        console.log("-------------", editor);
        console.log("-------------", selection);
        const text = editor.document.getText(selection);
        const file = vscode.workspace.asRelativePath(editor.document.uri);
        // Get the absolute path of the file
        const absoluteFile = editor.document.uri.fsPath;
        const step = {
          file: file,
          line: selection.start.line + 1, // Line numbers are 0-based, but tour expects 1-based
          line2: selection.end.line,
          text: text,
        };
        console.log(step);
        panel.sendMsgToWebview("select", step);
      }
      // } else {
      //   if (timeoutCounter > 10) {
      //     // Check for timeout after a certain number of attempts
      //     console.error("Timeout: Unable to find active text editor.");
      //   }
      //   timeoutCounter++;
      // }
      // Check every 100 milliseconds
    }
  );

  // const selectText = vscode.commands.registerCommand("walkthru.select", () => {
  //   console.log("Command walkthru.select started");

  //   // Ensure focus is in the editor area
  //   vscode.commands
  //     .executeCommand("workbench.action.focusActiveEditorGroup")
  //     .then(() => {
  //       console.log("Editor group focused");
  //     });

  //   let lastSelection: vscode.Selection | null = null;
  //   let selectionTimer: NodeJS.Timeout | null = null;
  //   let messageSent = false;
  //   let disposable: vscode.Disposable | null = null;

  //   const checkSelection = () => {
  //     if (messageSent) {
  //       return; // Exit if message has already been sent
  //     }

  //     console.log("Checking selection");
  //     const editor = vscode.window.activeTextEditor;
  //     if (editor) {
  //       console.log("Active editor found");
  //       try {
  //         const currentSelection = editor.selection;
  //         console.log(
  //           "-----------------------",
  //           currentSelection,
  //           "----------------",
  //           lastSelection
  //         );
  //         console.log("Current selection:", JSON.stringify(currentSelection));

  //         const selectionChanged =
  //           !lastSelection || !currentSelection.isEqual(lastSelection);

  //         if (selectionChanged) {
  //           console.log("Selection changed");
  //           lastSelection = currentSelection;

  //           if (selectionTimer) {
  //             clearTimeout(selectionTimer);
  //           }

  //           selectionTimer = setTimeout(() => {
  //             console.log("Selection stopped changing");
  //             try {
  //               const text = editor.document.getText(currentSelection);
  //               const file = vscode.workspace.asRelativePath(
  //                 editor.document.uri
  //               );
  //               const step = {
  //                 file: file,
  //                 line: currentSelection.start.line + 1, // Line numbers are 0-based
  //                 text: text,
  //               };

  //               console.log("Prepared step:", JSON.stringify(step));

  //               if (
  //                 typeof myPanel !== "undefined" &&
  //                 myPanel &&
  //                 myPanel.sendMsgToWebview
  //               ) {
  //                 console.log("Sending message to webview");
  //                 myPanel.sendMsgToWebview("select", step);
  //                 messageSent = true;

  //                 // Stop listening for changes
  //                 if (disposable) {
  //                   disposable.dispose();
  //                   console.log("Stopped listening for selection changes");
  //                 }
  //               } else {
  //                 console.error("myPanel or sendMsgToWebview is not defined");
  //               }
  //             } catch (error) {
  //               console.error("Error processing selection:", error);
  //             }
  //           }, 900); // Wait for 900ms after selection stops changing
  //         } else {
  //           console.log("Selection unchanged");
  //         }
  //       } catch (error) {
  //         console.error("Error accessing editor or selection:", error);
  //       }
  //     } else {
  //       console.log("No active editor found");
  //     }
  //   };

  //   // Listen for text selection changes
  //   disposable = vscode.window.onDidChangeTextEditorSelection(checkSelection);
  //   console.log("Listening for selection changes");
  // });

  context.subscriptions.push(disposable);
  context.subscriptions.push(selectText);
  // Listen for changes in the active text editor
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    // Check if the active editor is a webview
    if (
      editor &&
      editor.viewColumn === vscode.ViewColumn.Active &&
      editor.document.uri.scheme === "webview"
    ) {
      // Execute a command to show the activity bar item associated with the webview
      vscode.commands.executeCommand("setContext", "webviewPanelOpen", true);
    }
  });
}

export function deactivate() {}

// import * as vscode from "vscode";

// export function activate(context: vscode.ExtensionContext) {
//   let webview = vscode.commands.registerCommand("walkthru.react", () => {
//     let panel = vscode.window.createWebviewPanel(
//       "webview",
//       "React",
//       vscode.ViewColumn.Two,
//       {
//         enableScripts: true,
//       }
//     );

//     // web is for my react root directory, rename for yours

//     let scriptSrc = panel.webview.asWebviewUri(
//       vscode.Uri.joinPath(context.extensionUri, "web", "dist", "index.js")
//     );

//     let cssSrc = panel.webview.asWebviewUri(
//       vscode.Uri.joinPath(context.extensionUri, "web", "dist", "index.css")
//     );

//     panel.webview.html = `<!DOCTYPE html>
//         <html lang="en">
//           <head>
//             <link rel="stylesheet" href="${cssSrc}" />
//           </head>
//           <body>
//             <noscript>You need to enable JavaScript to run this app.</noscript>
//             <div id="root"></div>
//             <script src="${scriptSrc}"></script>
//           </body>
//         </html>
//         `;
//   });

//   context.subscriptions.push(webview);
// }

// export function deactivate() {}

//----------------------------------------------------------
//------------------------------------------------------------
//=============================================================
//-------------------------------------------------------------

//   const selectText = vscode.commands.registerCommand("walkthru.select", () => {
//     console.log("Command walkthru.select started");

//     // Ensure focus is in the editor area
//     vscode.commands
//       .executeCommand("workbench.action.focusActiveEditorGroup")
//       .then(() => {
//         console.log("Editor group focused");
//       })
//       .catch((error) => {
//         console.error("Error focusing editor group:", error);
//       });

//     let lastSelection = null;
//     let selectionTimer = null;

//     const checkSelection = () => {
//       console.log("Checking selection");
//       const editor = vscode.window.activeTextEditor;
//       if (editor) {
//         console.log("Active editor found");
//         try {
//           const currentSelection = editor.selection;
//           console.log("Current selection:", JSON.stringify(currentSelection));
//           console.log(
//             "Last selection:",
//             lastSelection ? JSON.stringify(lastSelection) : "null"
//           );

//           const selectionChanged =
//             !lastSelection || !currentSelection.isEqual(lastSelection);

//           if (selectionChanged) {
//             console.log("Selection changed");
//             lastSelection = currentSelection;

//             if (selectionTimer) {
//               clearTimeout(selectionTimer);
//             }

//             selectionTimer = setTimeout(() => {
//               console.log("Selection stopped changing");
//               try {
//                 const text = editor.document.getText(currentSelection);
//                 const file = vscode.workspace.asRelativePath(
//                   editor.document.uri
//                 );
//                 const step = {
//                   file: file,
//                   line: currentSelection.start.line + 1,
//                   text: text,
//                 };

//                 console.log("Prepared step:", JSON.stringify(step));

//                 if (
//                   typeof myPanel !== "undefined" &&
//                   myPanel &&
//                   myPanel.sendMsgToWebview
//                 ) {
//                   console.log("Sending message to webview");
//                   myPanel.sendMsgToWebview("select", step);
//                 } else {
//                   console.error("myPanel or sendMsgToWebview is not defined");
//                 }
//               } catch (error) {
//                 console.error("Error processing selection:", error);
//               }
//             }, 500);
//           } else {
//             console.log("Selection unchanged");
//           }
//         } catch (error) {
//           console.error("Error accessing editor or selection:", error);
//         }
//       } else {
//         console.log("No active editor found");
//       }
//     };

//     const disposable = vscode.window.onDidChangeTextEditorSelection(
//       checkSelection
//     );
//     console.log("Listening for selection changes");

//     // Dispose the event listener after 5 minutes to prevent potential memory leaks
//     setTimeout(() => {
//       disposable.dispose();
//       console.log("Stopped listening for selection changes");
//     }, 300000);
//   });

//-------------------------------------------------------------
//   const selectText = vscode.commands.registerCommand("walkthru.select", () => {
//     console.log("Command walkthru.select started");

//     // Ensure focus is in the editor area
//     vscode.commands
//       .executeCommand("workbench.action.focusActiveEditorGroup")
//       .then(() => {
//         console.log("Editor group focused");
//       })
//       .catch((error) => {
//         console.error("Error focusing editor group:", error);
//       });

//     let lastSelection = null;
//     let selectionTimer = null;
//     let messageSent = false;
//     let disposable = null;

//     const checkSelection = () => {
//       if (messageSent) {
//         return; // Exit if message has already been sent
//       }

//       console.log("Checking selection");
//       const editor = vscode.window.activeTextEditor;
//       if (editor) {
//         console.log("Active editor found");
//         try {
//           const currentSelection = editor.selection;
//           console.log("Current selection:", JSON.stringify(currentSelection));

//           const selectionChanged =
//             !lastSelection || !currentSelection.isEqual(lastSelection);

//           if (selectionChanged) {
//             console.log("Selection changed");
//             lastSelection = currentSelection;

//             if (selectionTimer) {
//               clearTimeout(selectionTimer);
//             }

//             selectionTimer = setTimeout(() => {
//               console.log("Selection stopped changing");
//               try {
//                 const text = editor.document.getText(currentSelection);
//                 const file = vscode.workspace.asRelativePath(
//                   editor.document.uri
//                 );
//                 const step = {
//                   file: file,
//                   line: currentSelection.start.line + 1,
//                   text: text,
//                 };

//                 console.log("Prepared step:", JSON.stringify(step));

//                 if (
//                   typeof myPanel !== "undefined" &&
//                   myPanel &&
//                   myPanel.sendMsgToWebview
//                 ) {
//                   console.log("Sending message to webview");
//                   myPanel.sendMsgToWebview("select", step);
//                   messageSent = true;

//                   // Stop listening for changes
//                   if (disposable) {
//                     disposable.dispose();
//                     console.log("Stopped listening for selection changes");
//                   }
//                 } else {
//                   console.error("myPanel or sendMsgToWebview is not defined");
//                 }
//               } catch (error) {
//                 console.error("Error processing selection:", error);
//               }
//             }, 900);
//           } else {
//             console.log("Selection unchanged");
//           }
//         } catch (error) {
//           console.error("Error accessing editor or selection:", error);
//         }
//       } else {
//         console.log("No active editor found");
//       }
//     };

//     disposable = vscode.window.onDidChangeTextEditorSelection(checkSelection);
//     console.log("Listening for selection changes");
//   });
//----------------------------------------------------------------

//=============================================================
