import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

// Interface for the documentation data structure
interface WalkthruDoc {
  id: string;
  title: string;
  // Add other properties that might be in the docs object
  // These would be based on your actual docs structure
  [key: string]: any; // Allow for additional properties
}

// Helper function to save or update docs in the .walkthru folder
const saveDocsToFile = (docs: WalkthruDoc): void => {
  // Create the .walkthru directory if it doesn't exist
  const walkthruDir: string = path.join(
    vscode.workspace.rootPath!,
    ".WalkThru"
  );

  if (!fs.existsSync(walkthruDir)) {
    fs.mkdirSync(walkthruDir);
  }

  // Construct the current file name using the sanitized title and id
  const safeTitle: string = docs.title
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase(); // Sanitize the title for filenames
  const currentFileName: string = `${safeTitle}.${docs.id}.walkthru.json`;
  const currentFilePath: string = path.join(walkthruDir, currentFileName);

  // Get existing files with the same id
  const existingFiles: string[] = fs
    .readdirSync(walkthruDir)
    .filter((file: string) => file.includes(docs.id));

  if (existingFiles.length > 0) {
    const oldFileName: string = existingFiles[0]; // Get the first match (assuming one file per id)
    const oldFilePath: string = path.join(walkthruDir, oldFileName);

    // If the title has changed, remove the old file
    if (oldFileName !== currentFileName) {
      console.log(`Title has changed, deleting old file: ${oldFileName}`);
      fs.unlinkSync(oldFilePath); // Delete the old file
    }
  }

  // Data to be saved (as JSON)
  const fileData: string = JSON.stringify(docs, null, 2); // Pretty-print with 2 spaces for readability

  try {
    // Write the updated data to the file (or create a new one)
    fs.writeFileSync(currentFilePath, fileData, "utf8");
    console.log(`Data saved/updated successfully at ${currentFilePath}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error saving documentation: ${error.message}`);
      throw error;
    } else {
      throw new Error("An unknown error occurred while saving documentation");
    }
  }
};

export default saveDocsToFile;
