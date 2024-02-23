const vscode = require("vscode");
const MyPanel = require("./src/rightView");
const MyTreeViewDataProvider = require("./src/leftTreeView");
const { join } = require("path");
const fs = require("fs");
const MarkdownIt = require("markdown-it");
const mapJsonDataToTree = require("./src/readTours")
var myPanel;
function activate(context) {

  const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath; // Get the root of the project
  const tourInfo = join(workspaceFolder, ".tours/tourInfo.json");

  // const tourInfo = join(context.extensionPath, "tours/tourInfo.json");
  let data = JSON.parse(fs.readFileSync(tourInfo, "utf-8"));

  // Create a new instance of MyTreeViewDataProvider
  let treeView = new MyTreeViewDataProvider(context, mapJsonDataToTree());
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("myTree", treeView)
  );


  // this is for Right Webview
  let rightView = vscode.commands.registerCommand(
    "webview.openSidePanel",
    (data) => {
      myPanel = new MyPanel(context, data);
    }
  );


  function changeWorkSapce() {
    vscode.commands.executeCommand("workbench.action.focusActiveEditorGroup");
    const editor = vscode.window.visibleTextEditors.filter(editor => editor.viewColumn === 1)[0];
    if (editor) {
      const selection = editor.selection;
      editor.visibleRanges
    }
  }
  // this is for selecting text
  const selectText = vscode.commands.registerCommand("webview.select", () => {
    // Ensure focus is in the editor area
    vscode.commands.executeCommand("workbench.action.focusActiveEditorGroup");

    let timeoutCounter = 0;

    const editor = vscode.window.visibleTextEditors.filter(editor => editor.viewColumn === 1)[0];
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
      console.log(step)
      myPanel.sendMsgToWebview("select", step);
    }
    // } else {
    //   if (timeoutCounter > 10) {
    //     // Check for timeout after a certain number of attempts
    //     console.error("Timeout: Unable to find active text editor.");
    //   }
    //   timeoutCounter++;
    // }
    // Check every 100 milliseconds
  });


  //---------------------------- Hell World Command -----------------------------------------------------------

  let helloWorld = vscode.commands.registerCommand(
    "webview.helloWorld",
    (node) => {
      console.log(node);
      vscode.window.showInformationMessage("Button From Side View Is clicked");
    }
  );

  // --------------------------- Play Tour -----------------------------------------------------
  const codeTourDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 255, 0, 0.3)', // Yellow highlight
    isWholeLine: false
  });
  function readJSONFromFile(filePath) {
    try {
      const jsonData = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(jsonData);
    } catch (error) {
      console.error('Error reading JSON file:', error);
      return null;
    }
  }

  async function playbackTour(tourData) {
    let tourRunning = true;
    if (!tourRunning) return;

    // vscode.commands.executeCommand("webview.openSidePanel", tourData)

    const webTour = new MyPanel(context, tourData);
    // vscode.commands.executeCommand("workbench.action.focusActiveEditorGroup");
    // const ActiveEditor = vscode.window.visibleTextEditors.filter(editor => editor.viewColumn === 1)[0];

    if (!tourData || !tourData.steps || tourData.steps.length === 0) {
      console.error('Invalid tour data');
      return;
    }

    const index = { stepIndex: 0 };

    const goToNextStep = (stepIndex) => {
      console.log(stepIndex, "-----------------x--------------")
      // stepIndex = stepIndex + 1
      // stepIndex = Math.min(stepIndex + 1, tourData.steps.length - 1);
      const step = tourData.steps[stepIndex];
      console.log(step)
      // Display current step description
      vscode.window.showInformationMessage(step.description);
      vscode.window.showInformationMessage(step.data.file);

      if (step.data.file && step.data.line) {
        const stepPath = join(workspaceFolder, step.data.file)
        vscode.workspace.openTextDocument(stepPath)
          .then(document => vscode.window.showTextDocument(document, {
            viewColumn: vscode.ViewColumn.One // Open in the first column
          }))
          .then(editor => {
            // Highlight the line of code
            const line = step.data.line - 1; // Line numbers are 1-based, vscode uses 0-based
            const decoration = { range: new vscode.Range(line, 0, line, Number.MAX_VALUE) };
            editor.setDecorations(codeTourDecorationType, [decoration]);
            // Scroll to the highlighted line
            editor.revealRange(new vscode.Range(line, 0, line, 0), vscode.TextEditorRevealType.InCenter);
          })
          .catch(error => console.error('Error opening document:', error));
      }
    };

    goToNextStep(index.stepIndex)

    webTour.emitter.on('next', function () {

      console.log("next ---------------emitted");
      index.stepIndex++; // Increment stepIndex within the shared index
      if (index.stepIndex >= tourData.steps.length) {
        tourRunning = false;
        // Stop the tour if we're out of bounds
        console.log("Tour ended: Reached the final step");
        if (vscode.window.activeTextEditor) {
          vscode.window.activeTextEditor.setDecorations(codeTourDecorationType, []);
        }
        // Add any necessary cleanup for when the tour stops here
        return;
      }
      console.log(index.stepIndex);
      goToNextStep(index.stepIndex); // Call goToNextStep within the shared index
    });

    webTour.emitter.on('previous', function () {
      console.log("previous ---------------emitted");
      index.stepIndex--; // Decrement stepIndex within the shared index
      if (index.stepIndex < 0) {
        // Stop the tour if we're out of bounds
        console.log("Tour ended: Reached the beginning");
        // Add any necessary cleanup for when the tour stops here
        return;
      }
      console.log(index.stepIndex);
      goToNextStep(index.stepIndex); // Call goToNextStep within the shared context
    });
    webTour.emitter.on('stop', function () {
      console.log("Tour stopped by user");
      tourRunning = false;
      // Cleanup: Remove decorations 
      if (vscode.window.activeTextEditor) {
        vscode.window.activeTextEditor.setDecorations(codeTourDecorationType, []);
      }
    });

  }


  let startTour = vscode.commands.registerCommand("webview.startTour", async (node) => {
    console.log(node)
    const tourFilePath = join(workspaceFolder, `.tours/${node.label}.json`)

    if (!tourFilePath) {
      vscode.window.showErrorMessage("No file path provided.");
      return;
    }

    const tourData = readJSONFromFile(tourFilePath);
    if (tourData) {
      // Start playback tour
      console.log(tourData)
      await playbackTour(tourData);
    } else {
      vscode.window.showErrorMessage("Error reading tour data.");
    }

  })

  //-------------------------------------------------------------------------------------------------
  //-------------------------------------------------------------------------------------------------
  let opneBothView = vscode.commands.registerCommand("webview.openboth", () => {
    vscode.commands.executeCommand("webview.openLeftSideView"); // Replace with your command ID
    vscode.commands.executeCommand("webview.openSidePanel");
  });

  // -------------------------------------------------------------------------------------------------
  context.subscriptions.push(rightView);
  // context.subscriptions.push(leftView);
  context.subscriptions.push(selectText);
  context.subscriptions.push(startTour);

  // // Listen for changes in the active text editor
  // vscode.window.onDidChangeActiveTextEditor((editor) => {
  //   // Check if the active editor is a webview
  //   if (
  //     editor &&
  //     editor.viewColumn === vscode.ViewColumn.Active &&
  //     editor.document.uri.scheme === "webview"
  //   ) {
  //     // Execute a command to show the activity bar item associated with the webview
  //     vscode.commands.executeCommand("setContext", "webviewPanelOpen", true);
  //   }
  // });



  //--------------------------------------------------------------------------------------------------------
  // Create a file system watcher to watch for changes in the JSON file
  const watcher = vscode.workspace.createFileSystemWatcher(
    tourInfo
  );
  // Define a handler function to refresh the tree view when the JSON file changes
  const handleFileChange = () => {
    treeView.refresh();

  }
  // Register the handler function with the file system watcher
  watcher.onDidChange(handleFileChange);
  watcher.onDidCreate(handleFileChange);
  watcher.onDidDelete(handleFileChange);

}

exports.activate = activate;




// commented out for tree view
// // Create a TreeView with the data provider
// const treeView = vscode.window.createTreeView("myTree", {
//   treeDataProvider,
// });
// Store the TreeView in the context so it can be disposed when necessary
// context.subscriptions.push(treeView);

// let leftView = vscode.commands.registerCommand(
//   "webview.openLeftSideView",
//   () => {
//     // // Create a new instance of MyTreeViewDataProvider
//     // const treeDataProvider = new MyTreeViewDataProvider(context);
//     // // Create a TreeView with the data provider
//     // const treeView = vscode.window.createTreeView("myTree", {
//     //   treeDataProvider,
//     // });
//     // // Store the TreeView in the context so it can be disposed when necessary
//     // context.subscriptions.push(treeView);
//   }
// );



// vscode.window.onDidChangeActiveTextEditor(editor => {
//   if (editor) {
//     const lineNumber = 10; // Change to your desired line number
//     const decoration = vscode.window.createTextEditorDecoration({
//       range: new vscode.Range(lineNumber, 0, lineNumber, 0), // Line range
//       renderOptions: {
//         after: {
//           contentText: "[My Button]", // Button text
//           color: "blue", // Button color
//           fontWeight: "bold", // Button style
//         },
//       },
//     });

//     // Handle hover action (optional)
//     decoration.onDidHover(() => {
//       vscode.window.showInformationMessage("Button hovered!");
//     });
//   }
// });


// ---------------------------------------------
// const options = ['Next', 'Previous', 'Stop'];
// const choice = await vscode.window.showQuickPick(options, {
//   placeHolder: `Step ${stepIndex + 1}/${tourData.steps.length}`,
// });

// if (!choice || choice === 'Stop') {
//   break;
// } else if (choice === 'Next') {
//   stepIndex = Math.min(stepIndex + 1, tourData.steps.length - 1);
//   if (stepIndex == tourData.steps.length) break;
// } else if (choice === 'Previous') {
//   stepIndex = Math.max(0, stepIndex - 1);
// }

// Clear the decoration after moving to the next step