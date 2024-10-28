import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid';
import Button from './Buttons/Button';
import Highlighter from './Highlighter';
import vscode from '../utils/VscodeSendMessage';
import FileExplorerModal from './FileExplorer/FileExlorerModel';
import FilePath from './FilePath/FilePath';
import AddSnippet from './AddSnippetModel/AddSnippet';
<<<<<<< HEAD
import { useDispatch, useSelector } from 'react-redux';
import { addDocs, updateDocs, updateTitle } from '../redux-store/docs';



=======
>>>>>>> 6cbf14c (.)

type Snippet = {
    file: string,
    line: number,
    text: string
<<<<<<< HEAD
    line2: number
=======
>>>>>>> 6cbf14c (.)
}

type Path = {
    contextValue: string,
    label: string,
    path: string
<<<<<<< HEAD
=======

}

type CodeDocs =
    | { type: "snippet", data: Snippet }
    | { type: "path", data: Path };
>>>>>>> 6cbf14c (.)

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
<<<<<<< HEAD



=======
    const [codeSn, setCodeSen] = useState<Snippet[]>([])
    const [path, setPath] = useState<Path[]>([])

    const [doc, setDoc] = useState<CodeDocs[]>([])
>>>>>>> 6cbf14c (.)



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
<<<<<<< HEAD
                handleAddDocs(message.data, message.type)

=======
                let docItem: CodeDocs = {
                    type: "snippet",
                    data: message.data
                }
                // setCodeSen([...codeSn, message.data])
                setDoc([...doc, docItem])
                console.log(message);
                // Stop listening once the message is received
>>>>>>> 6cbf14c (.)
                setListening(false);
            }
        };

        window.addEventListener('message', handleMessage);

        // Clean up the listener when not needed
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [listening]);


<<<<<<< HEAD
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
=======
    const handleAddDocs = (data: Path) => {
        console.log("------------------", data)
        let docItem: CodeDocs = {
            type: "path",
            data: data
        }
        // setCodeSen([...codeSn, message.data])
        setDoc([...doc, docItem])
        // if (data) {
        //     setPath([...path, data])
        // }

>>>>>>> 6cbf14c (.)
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
<<<<<<< HEAD
                {docs?.blocks?.map((item: any) => (
                    item.type === "snippet" ? <Highlighter key={item.id} filePath={item.data.file} startNumber={item?.data.line} endLine={item?.data.line2} content={item?.data.text} /> : <FilePath key={item.id} type={item.data.contextValue} path={item.data.path} />
                ))}

=======
                {doc.map((item) => (
                    item.type === "snippet" ? <Highlighter filePath={item.data.file} startNumber={item?.data.line} content={item?.data.text} /> : <FilePath type={item.data.contextValue} path={item.data.path} />
                ))}
                {/* {codeSn.map((item) => (<Highlighter filePath={item?.file} startNumber={item?.line} content={item?.text} />))}
                {path.map((item) => (<FilePath type={item.contextValue} path={item.path} />))} */}
>>>>>>> 6cbf14c (.)
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
<<<<<<< HEAD

=======
>>>>>>> 6cbf14c (.)
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