import React, { useState, useEffect } from 'react';
import FileExplorer from './FileExplorer'; // Assuming this is your existing File Explorer component
import { TreeNode } from '../../Types/types';
import vscode from '../../utils/VscodeSendMessage';
import filterFileStructure from './FilterData';

type Snippet = {
    file: string,
    line: number,
    text: string
    line2: number
}

type Path = {
    contextValue: string,
    label: string,
    path: string

}
type Props = {
    handleAddDocs: (data: Path | Snippet, type: "snippet" | "path") => void
}

const FileExplorerModal = ({ handleAddDocs }: Props) => {
    const [listening, setListening] = useState(true);
    const [fileData, setFileData] = useState<TreeNode>()
    const sendMessage = (command: string, data?: string) => {
        vscode?.postMessage({
            command: command,
            text: data
        });
        setListening(true);
    };
    useEffect(() => {

        if (!listening) return;
        sendMessage("getStructure", "t")

        // Listen for messages from the extension
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;

            if (message.command === "fileStructure") {
                console.log(message);
                const filteredData = filterFileStructure(message.data);
                setFileData(filteredData)
                // Stop listening once the message is received
                setListening(false);
            }
        };

        window.addEventListener('message', handleMessage);

        // Clean up the listener when not needed
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [listening]);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">

            {fileData ? <FileExplorer handleAdd={(selectedPath: string) => {
                console.log(selectedPath, "=============================")
                handleAddDocs(selectedPath, "path"); // Call parent function with selected path
            }} data={fileData} /> : ""}
        </div>
    );
};

export default FileExplorerModal;