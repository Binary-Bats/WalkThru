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
    TreeItemData | undefined | null
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private context: vscode.ExtensionContext;
  private data: WalkthruFile[] = [];

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    // Create the TreeView with the provider
    const treeView = vscode.window.createTreeView("walkthruView", {
      treeDataProvider: this,
      showCollapseAll: true, // Add collapse all button
    });

    // Initialize the data
    this.initialize().catch((err) => {
      console.error("Failed to initialize tree view:", err);
      vscode.window.showErrorMessage("Failed to initialize WalkThrus view");
    });
  }

  private async initialize(): Promise<void> {
    try {
      this.data = await getTreeJsonForWalkThrus();
      this._onDidChangeTreeData.fire(undefined);
    } catch (error) {
      console.error("Error loading walkthru data:", error);
      throw error;
    }
  }

  getChildren(element?: TreeItemData): Thenable<TreeItemData[]> {
    try {
      if (!element) {
        // Return root level (workspace)
        return Promise.resolve([this.createWorkspaceItem()]);
      }
      return Promise.resolve(element.children || []);
    } catch (error) {
      console.error("Error getting children:", error);
      return Promise.resolve([]);
    }
  }

  getTreeItem(element: TreeItemData): vscode.TreeItem {
    try {
      const treeItem = new vscode.TreeItem(
        element.label,
        element.children
          ? vscode.TreeItemCollapsibleState.Collapsed
          : vscode.TreeItemCollapsibleState.None
      );

      // Set the icon if available
      if (element.iconPath) {
        try {
          treeItem.iconPath = vscode.Uri.file(
            this.context.asAbsolutePath(element.iconPath)
          );
        } catch (error) {
          console.warn("Failed to set icon path:", error);
          // Continue without icon if there's an error
        }
      }

      // Set additional properties
      treeItem.contextValue = element.contextValue;

      // Add command only if contextValue is "file"
      if (element.contextValue === "file") {
        treeItem.command = {
          command: "walkthru.openWalkthru",
          title: "Open Walkthru",
          arguments: [element],
        };

        // Add tooltip for files
        treeItem.tooltip = `Open ${element.label} walkthru`;
      }

      return treeItem;
    } catch (error) {
      console.error("Error creating tree item:", error);
      return new vscode.TreeItem("Error");
    }
  }

  private createWorkspaceItem(): TreeItemData {
    try {
      return {
        label: "WalkThrus",
        contextValue: "workspace",
        children: this.data.map((file) => ({
          label: file.title,
          contextValue: "file",
          filename: file.fileName,
          iconPath: file.icon || "", // Provide default empty string if icon is undefined
        })),
      };
    } catch (error) {
      console.error("Error creating workspace item:", error);
      return {
        label: "Error loading WalkThrus",
        contextValue: "error",
        children: [],
      };
    }
  }

  public async refresh(): Promise<void> {
    try {
      await this.initialize();
      this._onDidChangeTreeData.fire(undefined);
    } catch (error) {
      console.error("Error refreshing tree view:", error);
      vscode.window.showErrorMessage("Failed to refresh WalkThrus view");
    }
  }
}
