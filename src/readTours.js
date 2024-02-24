const fs = require('fs')
const { join } = require('path')
const vscode = require('vscode')

let mapStepsJsonToTree = (title) => {
    const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const stepsJsonPath = join(workspaceFolder, `.tours/${title}.json`);

    // const stepsJsonData = fs.readFileSync(stepsJsonPath, 'utf-8');
    // const stepsJsonObject = JSON.parse(stepsJsonData);
    // const stepsArray = stepsJsonObject.steps.map((step) => ({
    //     label: `Step ${step.description}`,
    //     contextValue: 'Step',
    //     data: step.data,
    // }));
    // return stepsArray
    return fs.promises.readFile(stepsJsonPath, "utf-8")
        .then((stepsJsonData) => (JSON.parse(stepsJsonData)))
        .then((stepsJsonData) => stepsJsonData.steps.map((step) => ({
            label: `Step ${step.description}`,
            contextValue: "Step",
            iconPath: "icons/point.png",
            data: step.data,
        })));
}

let mapJsonDataToTree = (context) => {
    const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath; // Get the root of the project
    const tourInfo = join(workspaceFolder, ".WalkThru/index.json");
    let jsonData = JSON.parse(fs.readFileSync(tourInfo, "utf-8"));

    return {
        label: "Root",
        contextValue: "Tour",
        iconPath: "icons/route.png",
        children: jsonData.map((item) => (
            {
                label: item.title,
                iconPath: "icons/route.png",
                contextValue: "Tour",
                children: mapStepsJsonToTree(item.title)
            })),
    };
}

module.exports = mapJsonDataToTree;

















// const fs = require('fs')
// const { join } = require('path')
// mapJsonDataToTree = (jsonData) => {
//     const stepsInfo = join(context.extensionPath, "tours/Test.json");


//     mapStepsJsonToTree = (title) => {
//         const stepsJsonPath = path.join(this.context.extensionPath, `${title}.json`);
//         return fs.promises.readFile(stepsJsonPath, "utf-8")
//             .then((stepsJsonData) => JSON.parse(stepsJsonData))
//             .then((stepsJsonData) => stepsJsonData.map((step) => ({
//                 label: `Step ${step.data.line}`,
//                 contextValue: "Step",
//                 data: step.data,
//             })));
//     }

//     return {
//         label: "Root",
//         contextValue: "Tour",
//         children: jsonData.map((item) => (
//             {
//                 label: item.title,
//                 contextValue: "Tour",
//                 children: mapStepsJsonToTree(item.title)
//             })),
//     };
// }

// module.exports = mapJsonDataToTree


// mapJsonDataToTree(jsonData) {
//     const stepsJsonPath = path.join(this.context.extensionPath, `${jsonData.title}.json`);
//     return {
//         label: "Root",
//         contextValue: "Tour",
//         children: [
//             {
//                 label: jsonData.title,
//                 contextValue: "Tour",
//                 children: this.mapStepsJsonToTree(stepsJsonPath),
//             },
//         ],
//     };
// }




// Array.from({ length: item.numSteps }, (_, i) => ({
//     label: `Step ${i + 1}`,
//     contextValue: "Step",
// })),




// return {

//     label: jsonData.title,

//     contextValue: "Tour",

//     iconPath: jsonData.iconPath ? vscode.Uri.file(this.context.asAbsolutePath(jsonData.iconPath)) : undefined,

//     children: jsonData.steps.map((step) => ({

//         label: `Step ${step.description}`,

//         contextValue: "Step",

//         data: step.data,

//     })),

// };