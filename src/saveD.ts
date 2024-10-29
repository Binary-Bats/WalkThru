// saveDocsToFile.ts
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

// Interface for the documentation data structure
export interface WalkthruDoc {
  id: string;
  title: string;
  blocks: any;
}

/**
 * Saves or updates documentation files in the .walkthru folder
 * @param docs The documentation object to save
 * @returns Promise<void>
 * @throws Error if saving fails
 */
export async function saveDocsToFile(docs: WalkthruDoc): Promise<void> {
  // Validate input
  if (!docs.id || !docs.title) {
    throw new Error("Documentation must have both id and title");
  }

  // Get workspace folder
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    throw new Error(
      "No workspace folder found. Please open a workspace first."
    );
  }

  try {
    // Create the .walkthru directory
    const walkthruDir = path.join(workspaceFolder.uri.fsPath, ".walkthru");
    await fs.promises.mkdir(walkthruDir, { recursive: true });

    // Sanitize the title for use in filename
    const safeTitle = docs.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    // Construct filenames
    const newFileName = `${safeTitle}.${docs.id}.walkthru.json`;
    const newFilePath = path.join(walkthruDir, newFileName);

    // Find existing files with the same ID
    const files = await fs.promises.readdir(walkthruDir);
    const existingFile = files.find((file) => file.includes(docs.id));

    // Handle existing file
    if (existingFile) {
      const oldFilePath = path.join(walkthruDir, existingFile);
      if (existingFile !== newFileName) {
        await fs.promises.unlink(oldFilePath);
        vscode.window.showInformationMessage(
          `Renamed documentation file from ${existingFile} to ${newFileName}`
        );
      }
    }

    // Add metadata
    const enrichedDocs = {
      ...docs,
      updated: new Date().toISOString(),
      created: docs.created || new Date().toISOString(),
    };

    // Write the file
    await fs.promises.writeFile(
      newFilePath,
      JSON.stringify(enrichedDocs, null, 2),
      "utf8"
    );

    vscode.window.showInformationMessage(
      `Documentation saved successfully: ${newFileName}`
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while saving documentation";

    vscode.window.showErrorMessage(
      `Failed to save documentation: ${errorMessage}`
    );
    throw new Error(errorMessage);
  }
}

// Export both the function and interface
