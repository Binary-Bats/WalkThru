export type TreeNode = {
  label: string;
  path: string;
  contextValue: "folder" | "file";
  children?: TreeNode[]; // Optional property for children
};
