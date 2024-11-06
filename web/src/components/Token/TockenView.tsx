import React, { useState } from 'react';
import { AlertTriangleIcon, FileIcon, FolderIcon } from 'lucide-react';
import Path from '../Path/Path';

import { deleteBlocksById, updateDocBlocks } from '../../redux-store/docs';
import FileExlorerModel from '../FileExplorer/FileExlorerModel';
import { useDispatch, useSelector } from 'react-redux';
import { addDocs, updateDocs, updateTitle } from '../../redux-store/docs';
import { AppState } from '../../redux-store/docStore';

type PathData = {
    "content": string,
    "line": number,
    "range": {
        "start": number,
        "end": number
    },
    "path": string,
    "token": string,

};

type FilePathItem = {
    id: string,
    obsolete: boolean,
    outdated: boolean,
    updated?: boolean,
    type: "token",
    data: PathData
};

type FilePathProps = {
    item: FilePathItem,
};

const TokenView: React.FC<FilePathProps> = ({ item }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFileExplorer, setIsFileExplorer] = useState(false);
    const dispatch = useDispatch();
    const docs = useSelector((state: AppState) => state.docs.docs);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(deleteBlocksById(item.id));
    };

    const handleReselect = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFileExplorer(true);
        // Add reselect functionality here
    };

    const handleAddDocs = (data: any, type: "snippet" | "path") => {
        if (!data) {
            setIsFileExplorer(false);
            return
        }

        function updateBlock(blocks: any, item: any, targetId: string, newData: any) {
            return blocks.map(block => {
                if (block.type === 'token' && block.id === targetId) {
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

        let blocks = updateBlock(docs.blocks, item, item.id, data)

        dispatch(updateDocBlocks(blocks));
        setIsFileExplorer(false);


    };

    return (
        <div className='mb-5'>
            {isFileExplorer && <FileExlorerModel handleAddDocs={handleAddDocs} />}
            <div className="relative inline-block w-[100%]">
                {/* Hover Modal */}
                {item.obsolete && isHovered && (
                    <div onMouseLeave={(e) => {
                        const relatedTarget = e.relatedTarget as HTMLElement;
                        if (!relatedTarget?.closest('.hover-modal-container')) {
                            setIsHovered(false);
                        }
                    }} className="hover-modal-container text-white absolute bottom-full left-0 mb-2 w-full z-50">
                        {/* Invisible bridge to maintain hover */}
                        <div className="absolute w-full h-2 bottom-[-8px]" />

                        <div className="bg-[#5B1E31]  w-[80%] rounded-lg p-3 shadow-xl border border-zinc-700/50 whitespace-nowrap">
                            <div className="flex flex-col justify-center">
                                <div className="flex w-full rounded-xl px-3 py-2 bg-[#351F27] justify-between">
                                    <div className="   px-3 py-1 rounded-md flex items-center gap-2">

                                        <span>{item.data.path} does not exist</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        <span className="text-red-400 text-sm">Obsolete</span>
                                    </div>
                                </div>
                                <div className='mt-2 mb-2 px-6 items-center  text-lg flex gap-2'>

                                    <span>{item.data.content} </span></div>
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
                    </div>
                )}

                {/* Main File Path Display */}
                <div
                    className={`
                    inline-flex items-center gap-2 p-2 rounded-lg
                    ${item.obsolete
                            ? 'bg-red-900/30 text-red-400 border border-red-700/50'
                            : 'bg-slate-800 text-white'}
                `}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={(e) => {
                        const relatedTarget = e.relatedTarget as HTMLElement;
                        if (!relatedTarget?.closest('.hover-modal-container')) {
                            setIsHovered(false);
                        }
                    }}
                >

                    <Path path={item.data.path} type={item.type}>
                        {item.data.token}
                    </Path>
                    {!item.obsolete && (
                        <span className="text-[#3fab53] text-sm">✓✓</span>
                    )}
                    {item.obsolete ? <AlertTriangleIcon className="w-4 h-4 text-red-400" /> : ""}
                </div>
            </div>
        </div>
    );
};

export default TokenView;

