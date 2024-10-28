const fs = require("fs");
const path = require("path");
const vscode = require("vscode");

// function getDirectoryTree(dirPath, relativeTo) {
//     const dirContents = fs.readdirSync(dirPath, { withFileTypes: true });
//     const children = [];

//     for (const item of dirContents) {
//         const itemPath = path.join(dirPath, item.name);
//         const relativePath = path.relative(relativeTo, itemPath);

//         const node = {
//             label: `${item.name}`, // Label with relative path
//             path: relativePath,
//             contextValue: item.isDirectory() ? 'folder' : 'file'
//         };

//         if (item.isDirectory()) {
//             node.children = getDirectoryTree(itemPath, relativeTo);
//         }

//         children.push(node);
//     }

//     return children;
// }

type TreeNode = {
  label: string;
  path: string;
  contextValue: "folder" | "file";
  children?: TreeNode[]; // Optional property for children
};

function getDirectoryTree(dirPath: string, relativeTo: string): TreeNode[] {
  const dirContents = fs.readdirSync(dirPath, { withFileTypes: true });

  // Sort contents, placing directories first:
  dirContents.sort((item1, item2) => {
    if (item1.isDirectory() && !item2.isDirectory()) {
      return -1; // Directories before files
    } else if (!item1.isDirectory() && item2.isDirectory()) {
      return 1; // Files after directories
    } else {
      return item1.name.localeCompare(item2.name); // Alphabetical within type
    }
  });

  const children: TreeNode[] = [];
  for (const item of dirContents) {
    const itemPath = path.join(dirPath, item.name);
    const relativePath = path.relative(relativeTo, itemPath);

    const node: TreeNode = {
      label: `${item.name}`,
      path: relativePath,
      contextValue: item.isDirectory() ? "folder" : "file",
    };

    if (item.isDirectory()) {
      node.children = getDirectoryTree(itemPath, relativeTo); // Recursively add children
    }

    children.push(node);
  }

  return children;
}

export default function generateFileTreeJson() {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (workspaceFolders) {
    const rootFolder = workspaceFolders[0].uri.fsPath;

    const rootTree: TreeNode = {
      label: path.basename(rootFolder),
      path: rootFolder,
      contextValue: "folder",
      children: getDirectoryTree(rootFolder, rootFolder),
    };

    console.log(rootTree);
    return rootTree;
  } else {
    return {};
  }
}
