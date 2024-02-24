const vscode = require("vscode");
const path = require("path");
const marked = require("marked");
const saveTour = require("./savetours")
const EventEmitter = require('events');
const mapJsonDataToTree = require('./readTours')

//-----------------------------------------------
class SimpleEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    (this.events[event] || (this.events[event] = [])).push(listener);
  }

  emit(event, ...args) {
    (this.events[event] || []).forEach(listener => listener(...args));
  }
}

// -----------------------------------------------

class MyPanel {
  constructor(context, data) {
    this.emitter = new EventEmitter();
    this.panel = vscode.window.createWebviewPanel(
      "sidePanel",
      "WalkThru",
      vscode.ViewColumn.Two,
      {
        enableScripts: true, // Enable JavaScript in the webview
      }
    );
    this.data = data;
    this.focusOnFirst()
    this.context = context;
    this.setupMessageListener();
    this.handelJsonData();
    this.render();
  }

  handelJsonData() {
    this.panel.webview.postMessage({
      command: "testJson",
      data: this.data,
    });
  }

  sendMsgToWebview(command, data) {
    this.panel.webview.postMessage({
      command: command,
      data: data,
    });
  }
  setupMessageListener() {
    this.panel.onDidDispose(
      () => {
        console.log("Webview panel has been closed");
      },
      null,
      this.context.subscriptions
    );



    this.panel.webview.onDidReceiveMessage((message) => {
      if (message.command === "submitForm") {
        this.handleFormSubmission(message.data);
      } else if (message.command === "endTour") {
        this.handleFormSubmission(message.data);
        saveTour(this.context, message.data)
        this.panel.dispose()
        this.handleFormSubmission("Saved Data");
      } else if (message.command === "selectText") {
        console.log("----Selecting Text Command------");
        vscode.commands.executeCommand("webview.helloWorld");
        vscode.commands.executeCommand("webview.select");
      }
      else if (message.command === "next") {
        this.emitter.emit('next');
      }
      else if (message.command === "stop") {
        this.emitter.emit('stop');
      }
      else if (message.command === "previous") {
        this.emitter.emit('previous');
      }
    });
  }



  focusOnFirst() {
    vscode.commands.executeCommand("workbench.action.focusActiveEditorGroup");
    const editor = vscode.window.visibleTextEditors.filter(editor => editor.viewColumn === 1)[0]; // Or your desired column

  }
  handleFormSubmission(formData) {
    // Handle form submission data here
    vscode.window.showInformationMessage(
      `Received form data: ${JSON.stringify(formData)}`
    );
  }

  closePanel() {
    this.panel.dispose()
  }

  render() {
    const stylesPath = vscode.Uri.file(path.join(__dirname, "main.css"));
    const scriptPath = vscode.Uri.file(path.join(__dirname, "script.js"));
    const scriptJson = vscode.Uri.file(path.join(__dirname, "test.json"));
    const stylesSrc = this.panel.webview.asWebviewUri(stylesPath);
    const scriptSrc = this.panel.webview.asWebviewUri(scriptPath);
    const jsonSrc = this.panel.webview.asWebviewUri(scriptJson);
    this.panel.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" type="text/css" href="${stylesSrc}">
<link href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.1.0/github-markdown.min.css" rel="stylesheet"/>
<title>Collapsible Sections</title>
<style>
</style>
</head>
<body>

    <div class="collapsible">
        <button class="collapsible-btn">Walkthrough Configuration <span class="arrow">&#9660;</span>
       <hr>
        </button>
        
        <div class="content content1" >
            
            <div class="row">
                <div class="col-md-12">
                    <form action="index.html" method="post" id="topForm">
                        <h1>  </h1>
            
                        <fieldset>
            
                            <!-- <legend><span class="number">1</span> Your Basic Info</legend> -->
            
                            <label for="name">Name:</label>
                            <input type="text" id="name" name="user_name">
            
            
                            <label for="description">Description:</label>
                            <textarea id="description" name="description"></textarea>
            
                        </fieldset>
            
                        <button class="submitBtn" onclick="submitForm()" type="submit">Create Walkthrough</button>
            
                    </form>
                    <div action="index.html" id="walkThroughIfo">
                        <label for="name">Name:</label>
                        <div class="Description" id="waltTitle">

                        </div>
                        <label for="description">Description:</label>
                        <div class="Description">
                            <div class="mdDiv" id="walkDesc">
                            </div>
                        </div>
                    
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="collapsible">
        <button class="collapsible-btn">Add Steps <span class="arrow">&#9660;</span>
            <hr>
        </button>
        <div class="content"  id="bottomConDiv">
            <div class="row">
                <div class="col-md-12 >
                <div class="controllBtn" id="controllBtn">
                        <button class="ctnBtnIcn" onclick="previous()">◀</button>
                        <button class="ctnBtnIcn" onclick="stop()">◼</button>
                        <button class="ctnBtnIcn" onclick="next()">▶</button>
                </div>
                <div class="allStepsDiv" id="allStepsDiv">
                <p></p>
                </div>
                    <div class="addStepDiv" id="addStepsDiv">
                    <button class="addFirstBtn" id="addFirstStepBtn">Add Step </button>
                    <button class="submitBtn endTour addStepBtn" onclick="endStep()" type="submit">End Tour</button>
                    <form action="index.html" method="post" id="bottomForm">
                        <fieldset>    
                            <label for="description">Description:</label>
                            <textarea id="description" name="description"></textarea>
    
                        </fieldset>
    
                        <button class="submitBtn addStepBtn" onclick="addStep()" type="submit">Confirm</button>
    
                    </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
<script src="${scriptSrc}"></script>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>


    <script>    
    </script>

</body>
</html>
`;
  }
}

module.exports = MyPanel;

// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <link rel="stylesheet" type="text/css" href="${stylesSrc}">
//     <title>Form in Side Panel</title>
// </head>
// <body>
//     <div>
//         <h1>Form in Side Panel</h1>
//         <form id="myForm">
//             <label>
//                 First Name:
//                 <input
//                     type="text"
//                     name="firstName"
//                 />
//             </label>
//             <label>
//                 Last Name:
//                 <input
//                     type="text"
//                     name="lastName"
//                 />
//             </label>
//             <button type="button" onclick="submitForm()">Submit</button>
//         </form>
//     </div>
//     <script>
//     const vscode = acquireVsCodeApi();
//         function submitForm() {

//             const form = document.getElementById('myForm');
//             const formData = {
//                 firstName: form.firstName.value,
//                 lastName: form.lastName.value
//             };
//             vscode.postMessage({
//                 command: 'submitForm',
//                 data: formData
//             });
//         }
//     </script>
// </body>
// </html>
