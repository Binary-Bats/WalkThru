import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid';
import Button from './Buttons/Button';
import Highlighter from './Highlighter';
import vscode from '../utils/VscodeSendMessage';
import FileExplorerModal from './FileExplorer/FileExlorerModel';
import FilePath from './FilePath/FilePath';
import AddSnippet from './AddSnippetModel/AddSnippet';
import { useDispatch, useSelector } from 'react-redux';
import { addDocs, updateDocs, updateTitle } from '../redux-store/docs';




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

type CodeDocs =
    | { id: string, type: "snippet", data: Snippet }
    | { id: string, type: "path", data: Path };

const Home = () => {

    const docs = useSelector((state: any) => {
        console.log("State: ", state); // Check the state shape
        return state?.docs;
    });
    const dispatch = useDispatch()

    const [title, setTitle] = useState(docs.title);
    const [isSaved, setIsSaved] = useState(docs.title === "Untitled Docs" ? true : false);
    const [isEditing, setIsEditing] = useState(docs.title === "Untitled Docs" ? true : false);
    const [listening, setListening] = useState(false);
    const [isFileExOpen, setIsFileExOpen] = useState(false)
    const [isAddModel, setIsAddModel] = useState(false)






    const sendMessage = (command: string, data?: string) => {
        vscode?.postMessage({
            command: command,
            text: data
        });
        setListening(true);
    };

    useEffect(() => {
        if (!listening) return;
        // Listen for messages from the extension
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;

            if (message.command === 'select') {
                handleAddDocs(message.data, "snippet")

                setListening(false);
            }
        };

        window.addEventListener('message', handleMessage);

        // Clean up the listener when not needed
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [listening]);


    const handleAddDocs = (data: Path | Snippet, type: "snippet" | "path") => {
        if (data) {
            console.log("------------------23", data)
            let docItem: CodeDocs;
            if (type === "snippet") {
                docItem = { id: uuidv4(), type, data: data as Snippet };
            } else {
                docItem = { id: uuidv4(), type, data: data as Path };
            }
            if (docs?.blocks) {
                dispatch(updateDocs(docItem))
            }
        }
        setIsFileExOpen(false)
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isEditing) {
            setTitle(e.target.value);
            setIsSaved(false);
        }
    };

    const handleSaveClick = () => {
        if (isEditing) {
            setIsSaved(true);
            setIsEditing(false);
            if (docs?.title) {
                console.log("enter------")
                dispatch(updateTitle(title))
            } else {
                console.log("enter------2")
                let doc = {
                    "title": title,
                    blocks: []
                }
                dispatch(addDocs(doc))

            }
            console.log("+{++++++", docs.title)

            console.log('Title saved:', title);
        } else {
            setIsEditing(true);
        }
    };

    return (
        <div className="flex mt-5 mb-5 justify-center w-full">
            <div className="w-[90%] rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        className={`bg-transparent text-white text-[4rem] font-bold focus:outline-none ${isEditing ? 'border-blue-500' : 'border-transparent'
                            } pb-1 w-full ${!isEditing && 'cursor-not-allowed'}`}
                        readOnly={!isEditing}
                    />
                    <Button onClick={handleSaveClick} > {isEditing ? 'Save' : 'Update'}</Button>
                </div>

                <div className="border-b border-gray-600 mb-4"></div>
                {docs?.blocks?.map((item: any) => (
                    item.type === "snippet" ? <Highlighter key={item.id} filePath={item.data.file} startNumber={item?.data.line} endLine={item?.data.line2} content={item?.data.text} /> : <FilePath key={item.id} type={item.data.contextValue} path={item.data.path} />
                ))}

                <div className="inline-flex space-x-2 ring-2 ring-blue-500 rounded-lg p-2">
                    <Button onClick={() => {
                        setIsAddModel(true)
                        sendMessage("focusEditor", "t")
                    }}>
                        Add Snippet
                    </Button>
                    <Button onClick={() => { setIsFileExOpen(true) }}>
                        Add Path
                    </Button>
                </div>
                {isAddModel ? <AddSnippet handleAddToDocs={() => {
                    sendMessage("alert", "this is test")
                    setIsAddModel(false)
                }} handleClose={() => { setIsAddModel(false) }} /> : ""}
                {isFileExOpen ? <FileExplorerModal handleAddDocs={handleAddDocs} /> : ""}

            </div>
        </div>
    );
};

export default Home