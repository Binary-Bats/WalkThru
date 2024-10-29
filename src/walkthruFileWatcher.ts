import * as vscode from "vscode";
import * as path from "path";
import { MyTreeViewDataProvider } from "./treeView";

export class WalkthruFileWatcher {
  private fileWatcher: vscode.FileSystemWatcher | undefined;
  private treeDataProvider: MyTreeViewDataProvider;

  constructor(treeDataProvider: MyTreeViewDataProvider) {
    this.treeDataProvider = treeDataProvider;
    this.initializeWatcher();
  }

  private initializeWatcher(): void {
    try {
      // Get the workspace folders
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        console.warn("No workspace folders found");
        return;
      }

      // Create a file system watcher for .walkthru folder
      const walkthruPattern = new vscode.RelativePattern(
        workspaceFolders[0],
        "**/.walkthru/**"
      );

      this.fileWatcher = vscode.workspace.createFileSystemWatcher(
        walkthruPattern,
        false, // Don't ignore creates
        false, // Don't ignore changes
        false // Don't ignore deletes
      );

      // Register event handlers
      this.fileWatcher.onDidCreate(this.handleFileChange.bind(this));
      this.fileWatcher.onDidChange(this.handleFileChange.bind(this));
      this.fileWatcher.onDidDelete(this.handleFileChange.bind(this));

      console.log("File watcher initialized for .walkthru folder");
    } catch (error) {
      console.error("Error initializing file watcher:", error);
      vscode.window.showErrorMessage(
        "Failed to initialize .walkthru folder watcher"
      );
    }
  }

  private async handleFileChange(uri: vscode.Uri): Promise<void> {
    try {
      const filePath = uri.fsPath;
      // Only refresh if the file has .walkthru extension or is within .walkthru folder
      if (
        path.extname(filePath) === ".walkthru" ||
        filePath.includes(path.sep + ".walkthru" + path.sep)
      ) {
        console.log(`File change detected: ${filePath}`);
        // Add a small delay to ensure file system operations are complete
        await new Promise((resolve) => setTimeout(resolve, 100));
        await this.treeDataProvider.refresh();
      }
    } catch (error) {
      console.error("Error handling file change:", error);
    }
  }

  public dispose(): void {
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }
  }
}
