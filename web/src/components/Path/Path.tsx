import React from 'react'
import vscode from '../../utils/VscodeSendMessage'

type Props = {
    children: React.ReactNode
    path: string,
    startLine?: number,
    endLine?: number,
    type: "snippet" | "file" | "folder"
}



const Path = ({ children, startLine, endLine, path, type }: Props) => {
    const handleClick = () => {
        if (type !== "folder") {
            vscode?.postMessage({
                "command": "openDocs",
                "data": { path, startLine, endLine }
            })
        }

    }
    return (
        <span className=' hover:text-gray-100 cursor-pointer' onClick={handleClick}>{children}</span>
    )
}

export default Path