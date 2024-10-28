import * as vscode from "vscode";
import { getTreeJsonForWalkThrus } from "./readDocs";

// Interface for tree item data
interface TreeItemData {
  label: string;
  contextValue: string;
  children?: TreeItemData[];
  iconPath?: string;
  filename?: string;
}

// Interface for walkthru file data
interface WalkthruFile {
  title: string;
  fileName: string;
  icon?: string;
}

export default class MyTreeViewDataProvider
  implements vscode.TreeDataProvider<TreeItemData> {
  private _onDidChangeTreeData = new vscode.EventEmitter<
    TreeItemData | undefined
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private context: vscode.ExtensionContext;
  private data: WalkthruFile[] = []; // The tree data

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    vscode.window.createTreeView("myTree", {
      treeDataProvider: this,
    });
    this.initialize(); // Call initialize to load data
  }

  private async initialize(): Promise<void> {
    this.data = await getTreeJsonForWalkThrus(); // Await the promise
    this._onDidChangeTreeData.fire(undefined); // Notify that data has changed
  }

  // Called when children of a TreeItem are requested
  getChildren(element?: TreeItemData): Thenable<TreeItemData[]> {
    if (!element) {
      // Return root level (workspace)
      return Promise.resolve([this.createWorkspaceItem()]);
    }
    return Promise.resolve(element.children || []);
  }

  // Called when a specific TreeItem is requested
  getTreeItem(element: TreeItemData): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(
      element.label,
      element.children
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    );

    // Set the icon if available
    if (element.iconPath) {
      treeItem.iconPath = vscode.Uri.file(
        this.context.asAbsolutePath(element.iconPath)
      );
    }

    treeItem.contextValue = element.contextValue; // Set the context (e.g., file/folder)

    // Add command only if contextValue is "file"
    if (element.contextValue === "file") {
      treeItem.command = {
        command: "walkthru.helloWorld",
        title: "Tree Item Clicked",
        arguments: [element],
      };
    }

    return treeItem;
  }

  // Creates the workspace root item
  private createWorkspaceItem(): TreeItemData {
    console.log("+++++++++++++++++++++++++++++++", this.data);
    return {
      label: "WalkThrus",
      contextValue: "workspace",
      children: this.data.map((file) => ({
        label: file.title, // File title
        contextValue: "file",
        filename: file.fileName,
        iconPath: file.icon, // Icon path for the file
      })),
    };
  }

  // Manually refresh the tree view
  public refresh(): void {
    this.initialize();
    this._onDidChangeTreeData.fire(undefined); // Notify VSCode to refresh the tree view
  }
}
