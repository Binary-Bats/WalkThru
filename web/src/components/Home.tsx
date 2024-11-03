import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { addDocs, updateDocs, updateTitle } from '../redux-store/docs';
import Button from './Buttons/Button';
import Highlighter from './Highlighter';
import FileExplorerModal from './FileExplorer/FileExlorerModel';
import FilePath from './FilePath/FilePath';
import AddSnippet from './AddSnippetModel/AddSnippet';
import vscode from '../utils/VscodeSendMessage';
import { AppState } from '../redux-store/docStore';

type Snippet = {
    path: string;
    line_start: number;
    text: string;
    line_end: number;
};

type Path = {
    contextValue: string;
    label: string;
    path: string;
};

type CodeDocs =
    | { id: string; outdated: boolean; obsolete: boolean; type: "snippet"; data: Snippet }
    | { id: string; obsolete: boolean; type: "path"; data: Path };

const Home = () => {
    const dispatch = useDispatch();

    // Get the entire docs state to ensure we don't miss updates
    const docs = useSelector((state: AppState) => state.docs.docs);

    const [localTitle, setLocalTitle] = useState(docs.title);
    const [isSaved, setIsSaved] = useState(docs.title === "Untitled Docs");
    const [isEditing, setIsEditing] = useState(docs.title === "Untitled Docs");
    const [listening, setListening] = useState(false);
    const [isFileExOpen, setIsFileExOpen] = useState(false);
    const [isAddModel, setIsAddModel] = useState(false);

    // Update local title when docs title changes
    useEffect(() => {
        setLocalTitle(docs.title);
    }, [docs.title]);

    const sendMessage = (command: string, data?: string) => {
        vscode?.postMessage({
            command: command,
            text: data
        });
        setListening(true);
    };

    useEffect(() => {
        if (!listening) return;

        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            if (message.command === 'select') {
                handleAddDocs(message.data, "snippet");
                setListening(false);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [listening]);

    const handleAddDocs = (data: any, type: "snippet" | "path") => {
        if (!data) {
            setIsFileExOpen(false);
            return
        }

        let docItem: CodeDocs;
        if (type === "snippet") {
            docItem = {
                id: uuidv4(),
                outdated: false,
                obsolete: false,
                type,
                data: {
                    path: data.file,
                    line_start: data.line,
                    line_end: data.line2,
                    text: data.text
                }
            };
        } else {
            docItem = {
                id: uuidv4(),
                obsolete: false,
                type,
                data: data as Path
            };
        }

        dispatch(updateDocs(docItem));
        setIsFileExOpen(false);


    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isEditing) {
            setLocalTitle(e.target.value);
            setIsSaved(false);
        }
    };

    const handleSaveClick = () => {
        if (isEditing) {
            setIsSaved(true);
            setIsEditing(false);

            if (docs.title) {
                dispatch(updateTitle(localTitle));
            } else {
                dispatch(addDocs({ title: localTitle, blocks: [] }));
            }
        } else {
            setIsEditing(true);
        }
    };

    // Memoize blocks rendering
    const renderedBlocks = useMemo(() =>
        docs.blocks?.map((item: CodeDocs) => (
            item.type === "snippet"
                ? <Highlighter key={item.id} item={item} />
                : <FilePath key={item.id} item={item} />
        )),
        [docs.blocks]);

    return (
        <div className="flex mt-5 mb-5 justify-center w-full">
            {isAddModel && (
                <AddSnippet
                    handleAddToDocs={() => {
                        sendMessage("alert", "this is test");
                        setIsAddModel(false);
                    }}
                    handleClose={() => setIsAddModel(false)}
                />
            )}

            {isFileExOpen && <FileExplorerModal handleAddDocs={handleAddDocs} />}

            <div className="w-[90%] rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <input
                        type="text"
                        value={localTitle}
                        onChange={handleTitleChange}
                        className={`bg-transparent text-white text-[4rem] font-bold focus:outline-none 
                            ${isEditing ? 'border-blue-500' : 'border-transparent'}
                            pb-1 w-full ${!isEditing && 'cursor-not-allowed'}`}
                        readOnly={!isEditing}
                    />
                    <Button onClick={handleSaveClick}>
                        {isEditing ? 'Save' : 'Update'}
                    </Button>
                </div>

                <div className="border-b border-gray-600 mb-4" />

                {renderedBlocks}

                <div className="inline-flex space-x-2 ring-2 ring-blue-500 rounded-lg p-2">
                    <Button onClick={() => {
                        setIsAddModel(true);
                        sendMessage("focusEditor", "t");
                    }}>
                        Add Snippet
                    </Button>
                    <Button onClick={() => setIsFileExOpen(true)}>
                        Add Path
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Home;