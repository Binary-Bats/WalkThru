import React, { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { File, TriangleAlert, Ban } from "lucide-react";
import Path from "./Path/Path";
import languageMap from './../utils/languageMap.json';
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../redux-store/docStore";
import vscode from "../utils/VscodeSendMessage";
import { removeBlocksById, updateSession } from "../redux-store/session";
import { addDocs, deleteBlocksById, updateDocBlocks } from '../redux-store/docs';
import AddSnippet from "./AddSnippetModel/AddSnippet";



interface LanguageMap {
    [key: string]: string;
}

function detectLanguage(fileName: string): string {

    const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    const language: LanguageMap = languageMap;
    return language[ext].toLowerCase() || "Unknown language";
}


type Snippet = {
    path: string,
    line_start: number,
    text: string
    line_end: number
}




type CodeDocs = { id: string, outdated: boolean, updated?: boolean, obsolete: boolean, type: "snippet", data: Snippet }

type HighlighterProps = {
    item: CodeDocs


}



export default function Highlighter({ item: initialItem }: HighlighterProps) {

    const session = useSelector((state: AppState) => {

        return state.session.session;
    });
    const docs = useSelector((state: AppState) => {
        return state?.docs.docs;
    });
    const dispatch = useDispatch()

    const [listening, setListening] = useState(false);
    const [item, setItem] = useState(initialItem);
    const [updated, setUpdated] = useState(false);
    const [isAddModel, setIsAddModel] = useState(false)


    // Update local state when docs state changes
    // useEffect(() => {
    //     const updatedBlock = docs.blocks.find(block => block.id === item.id);
    //     if (updatedBlock && JSON.stringify(updatedBlock) !== JSON.stringify(item)) {
    //         setItem(updatedBlock);
    //     }
    // }, [docs.blocks, item.id]);

    const sendMessage = (command: string, data?: any) => {
        vscode?.postMessage({
            command: command,
            data: data
        });
        setListening(true);
    };

    useEffect(() => {
        // console.log('Highlighter item changed:', initialItem);
        setItem(initialItem)
        session.blocks.forEach((block) => {
            if (block.id === item.id) {
                console.log("Item on session storage ", block)


                setItem(block)
            }

        })
        const outdatedBlock = session.blocks.find(block => block.id === item.id && block.outdated === false);
        if (outdatedBlock) {
            if (initialItem.outdated && updated) {
                sendMessage("update", item)
            }

        }
        const obsoleteBlock = session.blocks.find(block => block.id === item.id && block.obsolete);
        if (obsoleteBlock && !initialItem.obsolete && updated) {
            dispatch(removeBlocksById(item.id));
            console.log(session, item)
        }

    }, [initialItem]);

    // console.log('Highlighter render:', item);
    useEffect(() => {

        if (!listening) return;
        // Listen for messages from the extension
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;

            if (message.command === 'updatedBlock') {
                console.log("updatedBlock", message.data)
                if (!message.data.obsolete) {
                    setUpdated(true);
                }
                handleUpdate(message.data)

                setListening(false);
            }


            if (message.command === 'select') {
                let newItem = {
                    ...item, data: {
                        ...item.data, text: message.data.text, path: message.data.file,
                        line_start: message.data.line,
                        line_end: message.data.line2,
                    }
                };


                setItem(newItem)


                handleUpdate(newItem, message.command)
                setListening(false);
            }
        };

        window.addEventListener('message', handleMessage);

        // Clean up the listener when not needed
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [listening]);

    useEffect(() => {
        session.blocks.forEach((block) => {
            if (block.id === item.id) {
                if (!block.obsolete) {

                }

                setItem(block)
            }
        })
    }, [session])


    const handlePrevious = () => {
        const foundBlock = docs.blocks.find((block) => block.id === item.id);
        if (foundBlock) {
            setItem((prevItem) => {
                return { ...prevItem, ...foundBlock };
            });
            const updatedBlocks = session.blocks.filter(block => block.id !== item.id);
            dispatch(updateSession(updatedBlocks));
            console.log(session, item, updateDocBlocks)
            setUpdated(false);
            console.log('Updated state:', updated); // Add a console log here

        }
    };

    useEffect(() => {
        console.log('Updated state:', updated);
    }, [updated]);
    const handleRemove = (item: any) => {
        dispatch(deleteBlocksById(item.id))
    }
    const handleUpdate = (data: CodeDocs, command?: string) => {
        if (command === "select") {
            const updatedBlocks = session.blocks.filter(block => block.id !== data.id);
            dispatch(updateSession(updatedBlocks));
            let newItem = {
                ...item, obsolete: false, data: data.data
            };
            setItem(() => newItem)
            addToDocs(newItem)

        } else {

            data.outdated = false;
            const existingBlockIndex = session.blocks.findIndex(block => block.id === data.id);
            let updatedBlocks;

            if (existingBlockIndex !== -1) {

                // Update existing block
                updatedBlocks = session.blocks.map((block, index) =>
                    index === existingBlockIndex ? data : block
                );
            } else {

                updatedBlocks = [...session.blocks, data];
            }



            dispatch(updateSession(updatedBlocks));
        }


    };

    const addToDocs = (item?: any) => {
        function updateBlock(blocks: any, targetId: string, newData: Snippet) {
            console.log(newData, "[][][][][][][][][][")
            return blocks.map(block => {
                // Check if the block is of type 'snippet' and has a matching ID
                if (block.type === 'snippet' && block.id === targetId) {
                    return {
                        ...block,
                        obsolete: false,
                        outdated: false,
                        data: {
                            ...block.data,
                            ...newData // Update only the fields in data that are provided in newData
                        }
                    };
                }
                // Return the block unmodified if conditions don't match
                return block;
            });
        }
        let blocks = updateBlock(docs.blocks, item.id, {
            path: item.data.path,
            line_start: item.data.line_start,
            line_end: item.data.line_end,
            text: item.data.text
        })

        const updatedBlocks = session.blocks.filter(block => block.id !== item.id);
        dispatch(updateSession(updatedBlocks));
        dispatch(updateDocBlocks(blocks))
        setUpdated(false)

    }

    const customStyle = {
        ...oneDark,
        'code[class*="language-"]': {
            ...oneDark['code[class*="language-"]'],
            backgroundColor: 'transparent',
            fontFamily: 'var(--vscode-editor-font-family)',
            fontSize: 'var(--vscode-editor-font-size)',
            fontWeight: 'var(--vscode-editor-font-weight)',
        },
        'pre[class*="language-"]': {
            ...oneDark['pre[class*="language-"]'],
            backgroundColor: 'transparent',
            margin: 0,
            padding: '1rem',
            scrollbarWidth: "none",  // For Firefox
            msOverflowStyle: "none"  // For Internet Explorer and Edge
        },
    };

    const backgroundColor = item.outdated ? "#5B4A1E" : item.obsolete ? "#5B1E31" : 'var(--vscode-editor-background)'

    const containerStyle = {
        backgroundColor: backgroundColor,
        // backgroundColor: "#5B4A1E",
        border: '1px solid var(--vscode-panel-border)',
    };

    const headerStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Light transparency for glassy effect
        color: 'var(--vscode-titleBar-foreground)',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)', // Soft shadow for floating effect
        backdropFilter: 'blur(8px)', // Frosted glass effect


        // borderRadius: '8px', // Rounded corners for smooth look
    };



    const syncedStyle = {
        color: 'var(--vscode-gitDecoration-addedResourceForeground)',
    };

    return (
        // <div className="flex justify-center mb-5 w-full [color-scheme:dark]">
        //     <div className="w-full rounded-2xl overflow-hidden shadow-xl" style={containerStyle}>
        //         <div className="flex justify-center w-[90%] items-center px-4 py-3" style={headerStyle}>
        //             <File size={16} className="mr-2" style={{ color: 'var(--vscode-foreground)' }} />
        //             <span className="text-sm font-medium" style={{ color: 'var(--vscode-foreground)' }}>
        //                 <Path path={filePath}
        //                     type="snippet"
        //                     startLine={startNumber}
        //                     endLine={endLine}>
        //                     {filePath}
        //                 </Path>
        //             </span>
        //             <span className="ml-auto text-sm flex items-center gap-1" style={syncedStyle}>
        //                 ✓✓
        //                 Synced
        //             </span>
        //         </div>
        //         <div style={{
        //             backgroundColor: 'var(--vscode-editor-background)',
        //         }}>
        //             <SyntaxHighlighter
        //                 language={detectLanguage(filePath)}
        //                 style={customStyle}
        //                 showLineNumbers={true}
        //                 startingLineNumber={startNumber}
        //                 wrapLines={true}
        //                 lineNumberStyle={{
        //                     color: 'var(--vscode-editorLineNumber-foreground)',
        //                     backgroundColor: 'transparent',
        //                     paddingRight: '1em',
        //                     userSelect: 'none'
        //                 }}
        //             >
        //                 {content}
        //             </SyntaxHighlighter>
        //         </div>
        //     </div>
        // </div>
        <div className="flex justify-center mb-5 w-full">
            <div className="w-[100%]  rounded-2xl overflow-hidden bg-[#1e1e1e79]" style={containerStyle}>
                <div className="flex justify-center px-1 mt-3  " >
                    <div className="bg-[#252526] w-[95%] rounded-2xl px-10 py-5 text-lg flex items-center" style={headerStyle}>
                        <File size={16} className="mr-2 text-[#858585]" />
                        <span className=" "><Path path={item.data.path} type={"snippet"} startLine={item.data.line_start} endLine={item.data.line_end}> {item.data.path}</Path></span>

                        {item.outdated ? <span className="ml-auto text-[#ff5c5c] "> ⚠ Outdated</span> : item.obsolete ? <span className="ml-auto text-[#ff5c5c] "> 🚫 Obsolete</span> : <span className="ml-auto text-[#3fab53] ">{updated ? "✓ Snippet Updated" : "✓✓ Synced"}</span>}

                    </div>
                </div>
                <div className="bg-[#1e1e1e] px-4 py-2" style={{
                    backgroundColor: backgroundColor,
                }} >
                    <SyntaxHighlighter
                        language={detectLanguage(item.data.path)}
                        style={customStyle}
                        showLineNumbers={true}
                        startingLineNumber={item.data.line_start}
                        wrapLines={true}
                    >
                        {item.data.text}
                    </SyntaxHighlighter>
                </div>
                {item.outdated ? <div className="flex justify-center px-1 mb-3  " >
                    <div className="  justify-end w-[95%] rounded-2xl px-8 py-4 text-lg flex items-center" style={headerStyle}>
                        <div className="flex gap-3">

                            <button onClick={() => sendMessage("update", item)} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200">
                                Update
                            </button>
                        </div>

                    </div>
                </div> : ""}
                {item.obsolete ? <div className="flex justify-center px-1 mb-3  " >
                    <div className="  justify-end w-[95%] rounded-2xl px-8 py-4 text-lg flex items-center" style={headerStyle}>
                        <div className="flex gap-3">
                            <button onClick={() => handleRemove(item)} className="px-4 py-2 rounded-md text-gray-300 hover:bg-zinc-800 transition-colors duration-200 border border-zinc-700">
                                Remove
                            </button>
                            <button onClick={() => {
                                setIsAddModel(true)
                                sendMessage("focusEditor")
                                sendMessage("openDocs", { path: item.data.path, startLine: item.data.line_start, endLine: item.data.line_end })
                            }} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200">
                                Reselect
                            </button>
                        </div>

                    </div>
                </div> : ""}
                {updated ? <div className="flex justify-center px-1 mb-3  " >
                    <div className=" w-[95%] rounded-2xl px-8 py-4 text-lg flex justify-between items-center p-4" style={headerStyle}>
                        <button onClick={() => handlePrevious()} className="px-4 py-2 rounded-xl text-gray-300  hover:bg-gray-600 transition-colors duration-200 border ">
                            Previous
                        </button>

                        <div className="flex gap-2">
                            <button onClick={() => {
                                setIsAddModel(true)
                                sendMessage("focusEditor")
                                sendMessage("openDocs", { path: item.data.path, startLine: item.data.line_start, endLine: item.data.line_end })
                            }} className="px-4 py-2 rounded-xl text-gray-300  hover:bg-gray-600 transition-colors duration-200 border ">
                                Reselect
                            </button>
                            <button onClick={() => addToDocs(item)} className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200">
                                Add to Doc
                            </button>
                        </div>

                    </div>
                </div> : ""}
            </div>
            {isAddModel ? <AddSnippet handleAddToDocs={() => {
                sendMessage("alert")
                setIsAddModel(false)
            }} handleClose={() => { setIsAddModel(false) }} /> : ""}
        </div>
    );
}



// import React from "react";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
// import { File } from "lucide-react";
// import Path from "./Path/Path";
// import languageMap from './../utils/languageMap.json';
// interface LanguageMap {
//     [key: string]: string;
// }


// function detectLanguage(fileName: string): string {
//     const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
//     const language: LanguageMap = languageMap

//     return language[ext] || "Unknown language";
// }


// type HighlighterProps = {
//     filePath: string,
//     content: string,
//     startNumber: number
//     endLine: number
// }

// export default function Highlighter({ filePath, content, startNumber, endLine }: HighlighterProps) {
//     const customStyle = {
//         ...oneDark,
//         'code[class*="language-"]': {
//             ...oneDark['code[class*="language-"]'],
//             backgroundColor: 'transparent',
//         },
//         'pre[class*="language-"]': {
//             ...oneDark['pre[class*="language-"]'],
//             backgroundColor: 'transparent',
//             margin: 0,
//         },
//     };


//     return (
// <div className="flex justify-center mb-5 w-full">
//     <div className="w-[100%]  rounded-xl overflow-hidden bg-[#1e1e1e79]">
//         <div className="flex justify-center px-1 mt-3 bg-[#1e1e1e] ">
//             <div className="bg-[#252526] w-[90%] rounded-2xl px-7 py-5 flex items-center">
//                 <File size={16} className="mr-2 text-[#858585]" />
//                 <span className="text-sm text-[#858585]"><Path path={filePath} type={"snippet"} startLine={startNumber} endLine={endLine}> {filePath}</Path></span>
//                 <span className="ml-auto text-[#3fab53] text-sm">✓✓ Synced</span>
//             </div>
//         </div>
//         <div className="bg-[#1e1e1e] p-4">
//             <SyntaxHighlighter
//                 language={detectLanguage(filePath)}
//                 style={customStyle}
//                 showLineNumbers={true}
//                 startingLineNumber={startNumber}
//                 wrapLines={true}
//             >
//                 {content}
//             </SyntaxHighlighter>
//         </div>
//     </div>
// </div>
//     );
// }