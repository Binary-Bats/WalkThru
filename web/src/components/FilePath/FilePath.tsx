import { File, Folder } from 'lucide-react'
import React from 'react'
import Path from '../Path/Path'

type Props = {
    type: "folder" | "file",
    path: string
}

function FilePath({ type, path }: Props) {
    return (
        <div>
<<<<<<< HEAD
            <div className='inline-flex  gap-2 p-2 bg-slate-800 rounded-lg mb-3 text-white'>{type === 'folder' ? <Folder size={16} /> : <File size={16} />} <span className="text-sm"><Path path={path} type={type}>{path}</Path></span>
=======
            <div className='inline-flex  gap-2 p-2 bg-slate-800 rounded-lg mb-3 text-white'>{type === 'folder' ? <Folder size={16} /> : <File size={16} />} <span className="text-sm">{path}</span>
>>>>>>> 6cbf14c (.)
                <span className="ml-auto text-[#3fab53] text-sm">✓✓ Synced</span> </div>
        </div>
    )
}

export default FilePath