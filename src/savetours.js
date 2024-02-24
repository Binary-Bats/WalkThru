const { join } = require("path");
const fs = require("fs");
const vscode = require('vscode')
const saveTour = (context, data) => {
    const projectName = vscode.workspace.name;
    const tourName = data.title.replace(/\s+/g, '-').toLowerCase(); // Convert tour name to lowercase and replace spaces with hyphens
    const tourFileName = `${tourName}.json`;
    const toursDir = join(vscode.workspace.rootPath, '.WalkThru');
    if (!fs.existsSync(toursDir)) {
        fs.mkdirSync(toursDir);
    }
    const filePath = join(toursDir, tourFileName);
    const indexPtah = join(toursDir, "index.json")
    let tourInfo = { title: tourName, numSteps: data.steps.length };
    saveTourData(filePath, data);
    appendToJson(indexPtah, tourInfo)


    // console.log("Saving Data..............");
    // const tourPath = join(context.extensionPath, "tours");
    // const tourInfoPath = join(context.extensionPath, "tours/index.json")
    // let tourInfo = { title: data.title, numSteps: data.steps.length };
    // appendToJson(tourInfoPath, tourInfo)
    // fs.writeFile(
    //     `${tourPath}/${data.title}.json`,
    //     JSON.stringify(data, null, 2),
    //     (err) => {
    //         if (err) {
    //             console.error(err);
    //         } else {
    //             console.log(`Saved ${data.title}.json with the data.`);
    //         }
    //     }
    // );
};

function appendToJson(filename, data) {
    // Read the existing data from the file
    fs.readFile(filename, "utf8", (err, jsonString) => {
        if (err) {
            if (err.code === "ENOENT") {
                // If the file doesn't exist, create a new array
                const newData = [data];
                fs.writeFile(filename, JSON.stringify(newData, null, 2), (err) => {
                    if (err) throw err;
                    console.log(`Created new file: ${filename}`);
                });
            } else {
                throw err;
            }
        } else {
            // Parse the existing data
            const existingData = JSON.parse(jsonString);
            // Append the new data to the existing data
            existingData.push(data);
            // Write the updated data back to the file
            fs.writeFile(filename, JSON.stringify(existingData, null, 2), (err) => {
                if (err) throw err;

                console.log(`Updated file: ${filename}`);
            });
        }
    });
}

module.exports = saveTour;


// Function to save tour data to a file
function saveTourData(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
        vscode.window.showInformationMessage(`Tour data saved to ${filePath}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Error saving tour data: ${error.message}`);
    }
}


// Define command for saving tour data to a JSON file
// let saveTourDisposable = vscode.commands.registerCommand('extension.saveTour', async () => {
//     const projectName = vscode.workspace.name;
//     const tourName = tourData.name.replace(/\s+/g, '-').toLowerCase(); // Convert tour name to lowercase and replace spaces with hyphens
//     const tourFileName = `${tourName}.json`;
//     const toursDir = path.join(vscode.workspace.rootPath, 'WalkThru');
//     if (!fs.existsSync(toursDir)) {
//         fs.mkdirSync(toursDir);
//     }
//     const filePath = path.join(toursDir, tourFileName);
//     saveTourData(filePath, tourData);
// });