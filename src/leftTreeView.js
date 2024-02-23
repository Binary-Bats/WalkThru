const vscode = require("vscode");
const mapJsonDataToTree = require('./readTours')
class MyTreeViewDataProvider {

  constructor(context, data) {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.context = context;
    this.view = vscode.window.createTreeView("myTree", {
      treeDataProvider: this,
    });
    this.data = data
    // Sample JSON data representing a tree structure
    // this.data = {
    //   label: "Root",
    //   contextValue: "folder",
    //   children: [
    //     {
    //       label: "Folder1",
    //       contextValue: "folder",
    //       children: [
    //         {
    //           label: "File1.js",
    //           contextValue: "file"
    //         },
    //         {
    //           label: "File2.js",
    //           contextValue: "file"
    //         },
    //       ],
    //     },
    //     {
    //       label: "Folder2",
    //       contextValue: "folder",
    //       children: [
    //         // {
    //         //   label: "Subfolder",
    //         //   children: [
    //         //     {
    //         //       label: "File3.js",
    //         //     },
    //         //   ],
    //         // },
    //         {
    //           label: "File4.js",
    //           contextValue: "file"
    //         },
    //       ],
    //     },
    //   ],
    // };
  }

  getChildren(element) {
    if (!element) {
      // If no element is provided, return the root level items
      return this.data.children;
    }
    return element.children;
  }

  getTreeItem(element) {
    const tree = new vscode.TreeItem(
      element.label,
      element.children
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    );
    // tree.iconPath = vscode.Uri.file(this.context.asAbsolutePath("play.png"));
    tree.contextValue = element.contextValue; // Set the contextValue
    tree.iconPath = this.context.asAbsolutePath(element.iconPath)
    console.log(this.context.asAbsolutePath("play.png"));
    // Add placeholder button functionality based on button type
    tree.command = {
      command: "webview.openLeftSideView",
      title: "test",
    };
    return tree;
  }
  refresh() {
    console.log('-------------Refreshing ----------------------')
    this.data = mapJsonDataToTree()
    // This assumes your getChildren/getTreeItem already leverage this._data 
    // Only fire the event if all is well
    if (this._onDidChangeTreeData) {
      this._onDidChangeTreeData.fire(undefined);
    }
  }
}

module.exports = MyTreeViewDataProvider;
