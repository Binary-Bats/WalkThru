import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

// Interface for blocks in the walkthru document
interface WalkthruBlock {
  // Add specific block properties based on your needs
  [key: string]: any;
}

// Interface for the walkthru document structure
interface WalkthruDoc {
  title: string;
  id: string;
  blocks: WalkthruBlock[];
  [key: string]: any; // For any additional properties
}

// Interface for the tree item structure
interface TreeItem {
  title: string;
  fileName: string;
  id: string;
  blocks: WalkthruBlock[];
  icon: string;
}

/**
 * Reads all `.walkthru.json` files and returns tree JSON structure
 * @param workspaceRoot The root path of the workspace
 * @returns Promise<TreeItem[]> Array of tree items
 */
async function getWalkThruDocsTree(workspaceRoot: string): Promise<TreeItem[]> {
  const folderPath: string = path.join(workspaceRoot, ".walkthru");

  // Ensure the folder exists
  if (!fs.existsSync(folderPath)) {
    vscode.window.showInformationMessage(`Folder not found: ${folderPath}`);
    return [];
  }

  // Read all files in the `.WalkThru` folder
  const walkThruFiles: string[] = fs
    .readdirSync(folderPath)
    .filter((file: string) => file.endsWith(".walkthru.json"));

  try {
    // Parse each `.walkthru.json` file and return the tree structure
    const treeItems: TreeItem[] = await Promise.all(
      walkThruFiles.map(async (file: string) => {
        const filePath: string = path.join(folderPath, file);
        const fileContent: string = await fs.promises.readFile(
          filePath,
          "utf-8"
        );
        const walkThruDoc: WalkthruDoc = JSON.parse(fileContent);

        // Return a JSON structure with title, filename, and additional properties
        return {
          title: walkThruDoc.title,
          fileName: file,
          id: walkThruDoc.id,
          blocks: walkThruDoc.blocks,
          icon: "icons/walkthru.png", // Path to the icon
        };
      })
    );

    return treeItems;
  } catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(
        `Error reading walkthru files: ${error.message}`
      );
    } else {
      vscode.window.showErrorMessage(
        "An unknown error occurred while reading walkthru files"
      );
    }
    return [];
  }
}

/**
 * Gets the tree JSON structure for walkthrus in the current workspace
 * @returns Promise<TreeItem[]> Array of tree items
 */
export async function getTreeJsonForWalkThrus(): Promise<TreeItem[]> {
  const workspaceRoot: string | undefined = vscode.workspace.workspaceFolders
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : undefined;

  if (workspaceRoot) {
    try {
      const walkThruTree: TreeItem[] = await getWalkThruDocsTree(workspaceRoot);
      // console.log("WalkThru Tree:", JSON.stringify(walkThruTree, null, 2)); // Output the tree structure
      return walkThruTree;
    } catch (error) {
      if (error instanceof Error) {
        vscode.window.showErrorMessage(
          `Error getting walkthru tree: ${error.message}`
        );
      } else {
        vscode.window.showErrorMessage(
          "An unknown error occurred while getting walkthru tree"
        );
      }
      return [];
    }
  }

  return [];
}
