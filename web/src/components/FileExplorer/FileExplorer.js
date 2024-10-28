"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const fa_1 = require("react-icons/fa");
const FileExplorer = ({ data, handleAdd }) => {
    const [expandedFolders, setExpandedFolders] = (0, react_1.useState)({});
    const [selectedItem, setSelectedItem] = (0, react_1.useState)(null);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    // Create a memoized index of all items for faster searching
    const itemIndex = (0, react_1.useMemo)(() => {
        const index = [];
        const traverse = (item, path = '') => {
            const fullPath = `${path}/${item.label}`;
            index.push({ ...item, fullPath });
            if (item.children) {
                item.children.forEach(child => traverse(child, fullPath));
            }
        };
        traverse(data);
        return index;
    }, [data]);
    const toggleFolder = (0, react_1.useCallback)((path) => {
        setExpandedFolders((prev) => ({
            ...prev,
            [path]: !prev[path]
        }));
    }, []);
    const renderItem = (0, react_1.useCallback)((item, depth = 0) => {
        const isFolder = item.contextValue === 'folder';
        const isExpanded = expandedFolders[item.path];
        const isSelected = selectedItem?.path === item.path;
        const itemClasses = `flex items-center p-1 hover:bg-gray-700 cursor-pointer ${isSelected ? 'bg-blue-600' : ''}`;
        if (depth === 0) {
            return item.children.map(child => renderItem(child, depth + 1)); // Start rendering from the first child
        }
        return (<div key={item.path}>
        <div className={itemClasses} onClick={() => {
                if (isFolder)
                    toggleFolder(item.path);
                setSelectedItem(item);
            }} style={{ paddingLeft: `${depth * 16}px` }}>
          <span className="mr-1">
            {isFolder ? (isExpanded ? <lucide_react_1.ChevronDown size={16}/> : <lucide_react_1.ChevronRight size={16}/>) : null}
          </span>
          <span className={`mr-2`}>
            {isFolder ? <lucide_react_1.Folder size={16}/> : <lucide_react_1.File className='ml-4' size={16}/>}
          </span>
          <span className={`text-sm `}>{item.label}</span>
        </div>
        {isFolder && isExpanded && item.children && (<div>
            {item.children.map(child => renderItem(child, depth + 1))}
          </div>)}
      </div>);
    }, [expandedFolders, selectedItem, toggleFolder]);
    const filteredData = (0, react_1.useMemo)(() => {
        if (!searchTerm)
            return [];
        const lowerSearchTerm = searchTerm.toLowerCase();
        return itemIndex.filter(item => item.label.toLowerCase().includes(lowerSearchTerm) ||
            item.fullPath.toLowerCase().includes(lowerSearchTerm));
    }, [searchTerm, itemIndex]);
    const renderSearchResults = (0, react_1.useCallback)((items) => {
        return items.map((item) => (<div key={item.fullPath} className={`flex items-center p-1 hover:bg-gray-700 cursor-pointer ${selectedItem?.path === item.path ? 'bg-blue-600' : ''}`} onClick={() => setSelectedItem(item)}>
        <span className="mr-2">
          {item.contextValue === 'folder' ? <lucide_react_1.Folder size={16}/> : <lucide_react_1.File size={16}/>}
        </span>
        <span className="text-sm">{item.fullPath}</span>
      </div>));
    }, [selectedItem]);
    return (<div className="bg-gray-900 text-white p-4 rounded-xl shadow-lg w-[80%]">
      <h2 className="text-xl font-bold mb-4">Select a Path</h2>
      <div className="relative mb-4">
        <input type="text" placeholder="Search File/Folder..." className="w-full bg-gray-800 text-white rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
        <lucide_react_1.Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
      </div>
      <div className='w-full flex bg-slate-700 px-3 py-2 mb-3 gap-2 items-center rounded-lg'><fa_1.FaGithub />{data.label}</div>
      <div className="overflow-y-auto max-h-96">
        {searchTerm ? renderSearchResults(filteredData) : renderItem(data)}
      </div>
      <button className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" 
    // onClick={() => {
    //   if (selectedItem) {
    //     console.log("Selected path:", selectedItem);
    //     // Here you can add the logic to add the selected path to your document
    //   }
    // }}
    onClick={() => { handleAdd(selectedItem); }}>
        Add to Doc
      </button>
    </div>);
};
exports.default = FileExplorer;
//# sourceMappingURL=FileExplorer.js.map