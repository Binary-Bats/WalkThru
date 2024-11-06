import fs from "fs";
import { verifyPath, verifySnippet } from "./utils";
import * as path from "path";
import * as vscode from "vscode";

interface Block {
  id: string;
  outdated: boolean;
  obsolete: boolean;
  type: string;
  data: {
    path: string;
    line_start?: number;
    line_end?: number;
    text?: string;
    label?: string;
    contextValue?: string;
  };
}

interface WalkThruDoc {
  id: string;
  title: string;
  blocks: Block[];
  updated: string;
  created: string;
}

export async function processJson(
  jsonInput: string | WalkThruDoc
): Promise<WalkThruDoc> {
  try {
    // Parse the input if it's a string
    let jsonData: WalkThruDoc;
    if (typeof jsonInput === "string") {
      try {
        jsonData = JSON.parse(jsonInput);
      } catch (parseError) {
        console.error("Error parsing JSON input:", parseError);
        throw new Error("Invalid JSON input");
      }
    } else {
      jsonData = jsonInput;
    }

    // Validate the JSON structure
    if (!jsonData || !Array.isArray(jsonData.blocks)) {
      throw new Error(
        "Invalid JSON structure: missing or invalid blocks array"
      );
    }

    // Deep clone the input to avoid modifying the original
    const processedData = JSON.parse(JSON.stringify(jsonData));

    // Process each block
    for (let i = 0; i < processedData.blocks.length; i++) {
      const block = processedData.blocks[i];

      if (!block || typeof block !== "object") {
        console.warn(`Skipping invalid block at index ${i}`);
        continue;
      }

      try {
        if (block.type === "snippet" || block.type === "token") {
          processedData.blocks[i] = await verifySnippet(block);
        } else if (block.type === "path") {
          // For path type blocks, just verify the path exists
          processedData.blocks[i] = await verifyPath(block);
        } else {
          console.warn(`Unknown block type "${block.type}" at index ${i}`);
        }
      } catch (blockError) {
        console.error(`Error processing block at index ${i}:`, blockError);
      }
    }

    // Update the timestamp
    processedData.updated = new Date().toISOString();

    return processedData;
  } catch (error) {
    console.error("Error in processJson:", error);
    throw error;
  }
}

async function openAndSelectLinesInDocument(
  filePath: string,
  startLine?: number,
  endLine?: number
): Promise<void> {
  try {
    // Get the workspace folders
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      throw new Error("No workspace folder is opened");
    }

    // Try to find the file in workspace folders
    let uri: vscode.Uri | undefined;

    // If it's an absolute path, use it directly
    if (path.isAbsolute(filePath)) {
      uri = vscode.Uri.file(filePath);
    } else {
      // Try to find the file in each workspace folder
      for (const folder of workspaceFolders) {
        const possiblePath = path.join(folder.uri.fsPath, filePath);
        try {
          await vscode.workspace.fs.stat(vscode.Uri.file(possiblePath));
          uri = vscode.Uri.file(possiblePath);
          break;
        } catch {
          continue;
        }
      }

      // If file wasn't found in any workspace folder
      if (!uri) {
        // Try as a relative path from the first workspace folder
        uri = vscode.Uri.file(
          path.join(workspaceFolders[0].uri.fsPath, filePath)
        );
      }
    }

    // Open the document and show it in the editor
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);

    // If line numbers are provided, select the range
    if (typeof startLine === "number" && typeof endLine === "number") {
      // Convert to 0-based line numbers and ensure they're within document bounds
      const zeroBasedStartLine = Math.max(0, startLine - 1);
      const zeroBasedEndLine = Math.min(
        document.lineCount - 1,
        Math.max(0, endLine - 1)
      );

      // Create positions for the start and end of the lines
      const startPos = new vscode.Position(zeroBasedStartLine, 0);
      const endPos = new vscode.Position(
        zeroBasedEndLine,
        document.lineAt(zeroBasedEndLine).text.length
      );

      // Create and set the selection
      const selection = new vscode.Selection(startPos, endPos);
      editor.selection = selection;

      // Reveal the selected range in the center of the editor
      editor.revealRange(
        new vscode.Range(startPos, endPos),
        vscode.TextEditorRevealType.InCenter
      );
    } else {
      // If no line numbers provided, just open the file
      editor.revealRange(
        new vscode.Range(0, 0, 0, 0),
        vscode.TextEditorRevealType.InCenter
      );
    }
  } catch (error) {
    console.error("Error opening document:", error);
    vscode.window.showErrorMessage(`Failed to open file: ${filePath}`);
  }
}

export { openAndSelectLinesInDocument };
