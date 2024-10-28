import { TreeNode } from "../../Types/types";

const filterFileStructure = (data: TreeNode) => {
  const isPackageDirectory = (name: string) => {
    const packageDirs = [
      "node_modules",
      "vendor",
      "packages",
      "libs",
      "dependencies",
    ];
    return packageDirs.some((dir) => name.toLowerCase().includes(dir));
  };

  const filterItem = (item: TreeNode) => {
    // Remove hidden files/folders and package directories
    if (item.label.startsWith(".") || isPackageDirectory(item.label)) {
      return null;
    }

    // If it's a file, keep it
    if (item.contextValue === "file") {
      return item;
    }

    // If it's a folder, filter its children
    if (item.children) {
      const filteredChildren: any = item.children
        .map(filterItem)
        .filter((child) => child !== null);

      // If the folder has no children after filtering, remove it
      if (filteredChildren.length === 0) {
        return null;
      }

      return {
        ...item,
        children: filteredChildren,
      };
    }

    return item;
  };

  return filterItem(data);
};

// Example usage:
// const filteredData = filterFileStructure(originalData);

export default filterFileStructure;
