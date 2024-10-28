import React, { useState, useMemo, useCallback } from 'react';
import { Folder, Play, File, ChevronRight, ChevronDown, Search } from 'lucide-react';
import { FaGithub } from "react-icons/fa";
import { TreeNode } from '../../Types/types';

type Props = {
  data: TreeNode
  handleAdd: (data: string) => void
}

const FileExplorer = ({ data, handleAdd }: Props) => {
  const [expandedFolders, setExpandedFolders] = useState<any>({});
  const [selectedItem, setSelectedItem] = useState<any | string>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Create a memoized index of all items for faster searching
  const itemIndex = useMemo(() => {
    type index = TreeNode & {
      fullPath: string
    }
    const index: index[] = []
    const traverse = (item: TreeNode, path = '') => {
      const fullPath = `${path}/${item.label}`;
      index.push({ ...item, fullPath });
      if (item.children) {
        item.children.forEach(child => traverse(child, fullPath));
      }
    };
    traverse(data);
    return index;
  }, [data]);

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders((prev: any) => ({
      ...prev,
      [path]: !prev[path]
    }));
  }, []);

  const renderItem = useCallback((item: TreeNode, depth = 0) => {
    const isFolder = item.contextValue === 'folder';
    const isExpanded = expandedFolders[item.path];
    const isSelected = selectedItem?.path === item.path;

    const itemClasses = `flex items-center p-1 hover:bg-gray-700 cursor-pointer ${isSelected ? 'bg-blue-600' : ''}`;

    if (depth === 0) {
      return item.children.map(child => renderItem(child, depth + 1)); // Start rendering from the first child
    }
    return (
      <div key={item.path}>
        <div
          className={itemClasses}
          onClick={() => {
            if (isFolder) toggleFolder(item.path);
            setSelectedItem(item);
          }}
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          <span className="mr-1">
            {isFolder ? (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : null}
          </span>
          <span className={`mr-2`} >
            {isFolder ? <Folder size={16} /> : <File className='ml-4' size={16} />}
          </span>
          <span className={`text-sm `}>{item.label}</span>
        </div>
        {isFolder && isExpanded && item.children && (
          <div>
            {item.children.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }, [expandedFolders, selectedItem, toggleFolder]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    return itemIndex.filter(item =>
      item.label.toLowerCase().includes(lowerSearchTerm) ||
      item.fullPath.toLowerCase().includes(lowerSearchTerm)
    );
  }, [searchTerm, itemIndex]);

  const renderSearchResults = useCallback((items: TreeNode[]) => {
    return items.map((item: any) => (
      <div
        key={item.fullPath}
        className={`flex items-center p-1 hover:bg-gray-700 cursor-pointer ${selectedItem?.path === item.path ? 'bg-blue-600' : ''}`}
        onClick={() => setSelectedItem(item)}
      >
        <span className="mr-2">
          {item.contextValue === 'folder' ? <Folder size={16} /> : <File size={16} />}
        </span>
        <span className="text-sm">{item.fullPath}</span>
      </div>
    ));
  }, [selectedItem]);

  return (
    <div className="bg-gray-900 text-white p-4 rounded-xl shadow-lg w-[80%]">
      <h2 className="text-xl font-bold mb-4">Select a Path</h2>
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search File/Folder..."
          className="w-full bg-gray-800 text-white rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
      </div>
      <div className='w-full flex bg-slate-700 px-3 py-2 mb-3 gap-2 items-center rounded-lg'><FaGithub />{data.label}</div>
      <div className="overflow-y-auto max-h-96">
        {searchTerm ? renderSearchResults(filteredData) : renderItem(data)}
      </div>
      <button
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        // onClick={() => {
        //   if (selectedItem) {
        //     console.log("Selected path:", selectedItem);
        //     // Here you can add the logic to add the selected path to your document
        //   }
        // }}
        onClick={() => { handleAdd(selectedItem) }}
      >
        Add to Doc
      </button>
    </div>
  );
};

export default FileExplorer;