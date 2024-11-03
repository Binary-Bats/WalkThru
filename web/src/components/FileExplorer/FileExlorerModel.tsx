import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import FileExplorer from './FileExplorer';
import { TreeNode } from '../../Types/types';
import vscode from '../../utils/VscodeSendMessage';
import filterFileStructure from './FilterData';

type Snippet = {
    path: string;
    line_start: number;
    text: string;
    line_end: number;
}

type Path = {
    contextValue: string;
    label: string;
    path: string;
}

type Props = {
    handleAddDocs: (data: Path | Snippet, type: "snippet" | "path") => void;
}

// Memoize FileExplorer component to prevent unnecessary re-renders
const MemoizedFileExplorer = memo(FileExplorer);

const FileExplorerModal = ({ handleAddDocs }: Props) => {
    const [listening, setListening] = useState(true);
    const [fileData, setFileData] = useState<TreeNode>();

    // Memoize the sendMessage function
    const sendMessage = useCallback((command: string, data?: string) => {
        vscode?.postMessage({
            command: command,
            text: data
        });
        setListening(true);
    }, []);

    // Memoize the handleAdd callback
    const handleAdd = useCallback((selectedPath: string) => {
        console.log(selectedPath, "=============================");
        handleAddDocs(selectedPath, "path");
    }, [handleAddDocs]);

    // Memoize the message handler
    const handleMessage = useCallback((event: MessageEvent) => {
        const message = event.data;

        if (message.command === "fileStructure") {
            console.log(message);
            // Move the filtering to a web worker if the data is large
            const filteredData = filterFileStructure(message.data);
            setFileData(filteredData);
            setListening(false);
        }
    }, []);

    useEffect(() => {
        if (!listening) return;

        // Only send message if we're listening and don't have fileData
        if (!fileData) {
            sendMessage("getStructure", "t");
        }

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [listening, handleMessage, sendMessage, fileData]);

    // Use React.memo pattern for the modal wrapper
    const modalContent = useMemo(() => (
        fileData ? (
            <MemoizedFileExplorer
                handleAdd={handleAdd}
                data={fileData}
            />
        ) : null
    ), [fileData, handleAdd]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center z-[1000] justify-center p-4">
            {modalContent}
        </div>
    );
};

// Memoize the entire component to prevent unnecessary re-renders from parent
export default memo(FileExplorerModal);