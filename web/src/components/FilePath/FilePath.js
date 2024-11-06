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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const Path_1 = __importDefault(require("../Path/Path"));
const docs_1 = require("../../redux-store/docs");
const FileExlorerModel_1 = __importDefault(require("../FileExplorer/FileExlorerModel"));
const react_redux_1 = require("react-redux");
const FilePath = ({ item }) => {
    const [isHovered, setIsHovered] = (0, react_1.useState)(false);
    const [isFileExplorer, setIsFileExplorer] = (0, react_1.useState)(false);
    const dispatch = (0, react_redux_1.useDispatch)();
    const docs = (0, react_redux_1.useSelector)((state) => state.docs.docs);
    const handleDelete = (e) => {
        e.stopPropagation();
        dispatch((0, docs_1.deleteBlocksById)(item.id));
    };
    const handleReselect = (e) => {
        e.stopPropagation();
        setIsFileExplorer(true);
        // Add reselect functionality here
    };
    const handleAddDocs = (data, type) => {
        if (!data) {
            setIsFileExplorer(false);
            return;
        }
        function updateBlock(blocks, item, targetId, newData) {
            return blocks.map(block => {
                if (block.type === 'path' && block.id === targetId) {
                    return {
                        ...block,
                        obsolete: false,
                        data: newData
                    };
                }
                return block;
            });
        }
        // let docItem: CodeDocs;
        // if (type === "snippet") {
        //     docItem = {
        //         id: uuidv4(),
        //         outdated: false,
        //         obsolete: false,
        //         type,
        //         data: {
        //             path: data.file,
        //             line_start: data.line,
        //             line_end: data.line2,
        //             text: data.text
        //         }
        //     };
        // } else {
        //     docItem = {
        //         id: uuidv4(),
        //         obsolete: false,
        //         type,
        //         data: data as Path
        //     };
        // }
        let blocks = updateBlock(docs.blocks, item, item.id, data);
        dispatch((0, docs_1.updateDocBlocks)(blocks));
        setIsFileExplorer(false);
    };
    return (<div className='mb-5'>
            {isFileExplorer && <FileExlorerModel_1.default handleAddDocs={handleAddDocs}/>}
            <div className="relative inline-block w-[100%]">
                {/* Hover Modal */}
                {item.obsolete && isHovered && (<div onMouseLeave={(e) => {
                const relatedTarget = e.relatedTarget;
                if (!relatedTarget?.closest('.hover-modal-container')) {
                    setIsHovered(false);
                }
            }} className="hover-modal-container text-white absolute bottom-full left-0 mb-2 w-full z-50">
                        {/* Invisible bridge to maintain hover */}
                        <div className="absolute w-full h-2 bottom-[-8px]"/>

                        <div className="bg-[#5B1E31]  w-[80%] rounded-lg p-3 shadow-xl border border-zinc-700/50 whitespace-nowrap">
                            <div className="flex flex-col justify-center">
                                <div className="flex w-full rounded-xl px-3 py-2 bg-[#351F27] justify-between">
                                    <div className="   px-3 py-1 rounded-md flex items-center gap-2">
                                        {item.data.contextValue === 'folder'
                ? <lucide_react_1.FolderIcon className="w-4 h-4" size={16}/>
                : <lucide_react_1.FileIcon className="w-4 h-4" size={16}/>}
                                        <span>{item.data.contextValue} does not exist</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">

                                        <span className="text-red-400 flex items-center gap-2 text-sm"><lucide_react_1.CircleSlash className='w-4 h-4' size={16}/>Obsolete</span>
                                    </div>
                                </div>
                                <div className='mt-2 mb-2 px-6 items-center  text-lg flex gap-2'>
                                    {item.data.contextValue === 'folder'
                ? <lucide_react_1.FolderIcon className="w-5 h-5" size={16}/>
                : <lucide_react_1.FileIcon className="w-5 h-5" size={16}/>}
                                    <span>{item.data.label} </span></div>
                                <div className="flex w-full rounded-xl px-3 py-2 bg-[#351F27] justify-end">
                                    <div className="flex gap-3">
                                        <button onClick={handleDelete} className="px-2 py-1 rounded-md text-gray-300 hover:bg-zinc-800 transition-colors duration-200 border border-zinc-700">
                                            Remove
                                        </button>
                                        <button onClick={handleReselect} className="px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200">
                                            Reselect
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>)}

                {/* Main File Path Display */}
                <div className={`
                    inline-flex items-center gap-2 p-2 rounded-lg
                    ${item.obsolete
            ? 'bg-red-900/30 text-red-400 border border-red-700/50'
            : 'bg-slate-800 text-white'}
                `} onMouseEnter={() => setIsHovered(true)} onMouseLeave={(e) => {
            const relatedTarget = e.relatedTarget;
            if (!relatedTarget?.closest('.hover-modal-container')) {
                setIsHovered(false);
            }
        }}>
                    {item.data.contextValue === 'folder'
            ? <lucide_react_1.FolderIcon className="w-4 h-4"/>
            : <lucide_react_1.FileIcon className="w-4 h-4"/>}
                    <Path_1.default path={item.data.path} type={item.data.contextValue}>
                        {item.data.path}
                    </Path_1.default>
                    {!item.obsolete && (<span className="text-[#3fab53] text-sm"><lucide_react_1.CheckCheck className='w-4 h-4' size={16}/></span>)}
                    {item.obsolete ? <lucide_react_1.CircleSlash className='w-4 h-4 text-red-500'/> : ""}
                </div>
            </div>
        </div>);
};
exports.default = FilePath;
// import React, { useState } from 'react';
// import { FileIcon, FolderIcon, TrashIcon, AlertTriangleIcon } from 'lucide-react';
// import Path from '../Path/Path';
// import { useDispatch } from 'react-redux';
// import { deleteBlocksById } from '../../redux-store/docs';
// type PathData = {
//     contextValue: string,
//     label: string,
//     path: string
// };
// type FilePathItem = {
//     id: string,
//     obsolete: boolean,
//     type: "path",
//     data: PathData
// };
// type FilePathProps = {
//     item: FilePathItem,
// };
// const FilePath: React.FC<FilePathProps> = ({ item }) => {
//     const [showDelete, setShowDelete] = useState(false);
//     const dispatch = useDispatch()
//     const handleDelete = (e: React.MouseEvent) => {
//         e.stopPropagation();
//         dispatch(deleteBlocksById(item.id))
//     };
//     const baseClasses = "inline-flex items-center gap-2 p-2 rounded-lg mb-3 ";
//     const styleClasses = item.obsolete
//         ? "bg-red-900/30 text-red-400 border border-red-700/50"
//         : "bg-slate-800 text-white";
//     return (
//         <div >
//             <div
//                 className={`${baseClasses} ${styleClasses}`}
//                 onMouseEnter={() => item.obsolete && setShowDelete(true)}
//                 onMouseLeave={() => setShowDelete(false)}
//             >
//                 {item.data.contextValue === 'folder'
//                     ? <FolderIcon className="w-4 h-4" />
//                     : <FileIcon className="w-4 h-4" />
//                 }
//                 <Path path={item.data.path} type={item.data.contextValue}>{item.data.path}</Path>
//                 {!item.obsolete && (
//                     <span className="text-[#3fab53] text-sm">✓✓</span>
//                 )}
//                 {item.obsolete && (
//                     <>
//                         {showDelete ? (
//                             <button
//                                 onClick={handleDelete}
//                                 className="p-1 hover:bg-red-800/50 rounded transition-colors"
//                                 title="Delete"
//                             >
//                                 <TrashIcon className="w-4 h-4 text-red-400" />
//                             </button>
//                         ) : (
//                             <AlertTriangleIcon className="w-4 h-4 text-red-400" />
//                         )}
//                     </>
//                 )}
//             </div>
//         </div >
//     );
// };
// export default FilePath;
// import { File, Folder } from 'lucide-react'
// import React from 'react'
// import Path from '../Path/Path'
// type Path = {
//     contextValue: string,
//     label: string,
//     path: string
// }
// type FilePath = { id: string, obsolete: boolean, type: "path", data: Path }
// type Props = {
//     item: FilePath
// }
// function FilePath({ item }: Props) {
//     console.log(item, "====================")
//     return (
//         <div>
//             <div className='inline-flex  gap-2 p-2 bg-slate-800 rounded-lg mb-3 text-white'>{item.data.contextValue === 'folder' ? <Folder size={16} /> : <File size={16} />} <span className="text-sm"><Path path={item.data.path} type={item.data.contextValue}>{item.data.path}</Path></span>
//                 <span className="ml-auto text-[#3fab53] text-sm">✓✓</span> </div>
//         </div>
//     )
// }
// export default FilePath
//# sourceMappingURL=FilePath.js.map