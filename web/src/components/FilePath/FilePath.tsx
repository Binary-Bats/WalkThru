import React, { useState } from 'react';
import { FileIcon, FolderIcon, TrashIcon, AlertTriangleIcon } from 'lucide-react';
import Path from '../Path/Path';
import { useDispatch } from 'react-redux';
import { deleteBlocksById } from '../../redux-store/docs';

type PathData = {
    contextValue: string,
    label: string,
    path: string
};

type FilePathItem = {
    id: string,
    obsolete: boolean,
    type: "path",
    data: PathData
};

type FilePathProps = {
    item: FilePathItem,

};

const FilePath: React.FC<FilePathProps> = ({ item }) => {
    const [showDelete, setShowDelete] = useState(false);
    const dispatch = useDispatch()

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(deleteBlocksById(item.id))
    };

    const baseClasses = "inline-flex items-center gap-2 p-2 rounded-lg mb-3 ";
    const styleClasses = item.obsolete
        ? "bg-red-900/30 text-red-400 border border-red-700/50"
        : "bg-slate-800 text-white";

    return (
        <div >
            <div
                className={`${baseClasses} ${styleClasses}`}
                onMouseEnter={() => item.obsolete && setShowDelete(true)}
                onMouseLeave={() => setShowDelete(false)}
            >
                {item.data.contextValue === 'folder'
                    ? <FolderIcon className="w-4 h-4" />
                    : <FileIcon className="w-4 h-4" />
                }
                <Path path={item.data.path} type={item.data.contextValue}>{item.data.path}</Path>
                {!item.obsolete && (
                    <span className="text-[#3fab53] text-sm">✓✓</span>
                )}
                {item.obsolete && (
                    <>
                        {showDelete ? (
                            <button
                                onClick={handleDelete}
                                className="p-1 hover:bg-red-800/50 rounded transition-colors"
                                title="Delete"
                            >
                                <TrashIcon className="w-4 h-4 text-red-400" />
                            </button>
                        ) : (
                            <AlertTriangleIcon className="w-4 h-4 text-red-400" />
                        )}
                    </>
                )}
            </div>
        </div >
    );
};

export default FilePath;



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