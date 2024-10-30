import React, { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { File, TriangleAlert, Ban } from "lucide-react";
import Path from "./Path/Path";
import languageMap from './../utils/languageMap.json';
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../redux-store/docStore";
import vscode from "../utils/VscodeSendMessage";
import { updateSession } from "../redux-store/session";
import AddSnippet from "./AddSnippetModel/AddSnippet";
const [isAddModel, setIsAddModel] = useState(false)

interface LanguageMap {
    [key: string]: string;
}

function detectLanguage(fileName: string): string {

    const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    const language: LanguageMap = languageMap;
    return language[ext] || "Unknown language";
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
    const dispatch = useDispatch()

    const [listening, setListening] = useState(false);
    const [item, setItem] = useState(initialItem);
    const [updated, setUpdated] = useState(false);
    const [isAddModel, setIsAddModel] = useState(false)




    const sendMessage = (command: string, data?: CodeDocs) => {
        vscode?.postMessage({
            command: command,
            data: data
        });
        setListening(true);
    };


    useEffect(() => {

        if (!listening) return;
        // Listen for messages from the extension
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;

            if (message.command === 'updatedBlock') {
                handleUpdate(message.data)

                setListening(false);
            }

            if (message.command === 'select') {
                item.data.text = message.data.text
                handleUpdate(item)
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
                setUpdated(true)
                setItem(block)
            }
        })
    }, [session])


    const handleUpdate = (data: CodeDocs) => {
        data.outdated = false;
        const existingBlockIndex = session.blocks.findIndex(block => block.id === data.id);
        let updatedBlocks;

        if (existingBlockIndex !== -1) {
            // Update existing block
            updatedBlocks = session.blocks.map((block, index) =>
                index === existingBlockIndex ? data : block
            );
        } else {
            // Add new block
            updatedBlocks = [...session.blocks, data];
        }

        dispatch(updateSession(updatedBlocks));
    };

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
                            <button className="px-4 py-2 rounded-md text-gray-300 hover:bg-zinc-800 transition-colors duration-200 border border-zinc-700">
                                Remove
                            </button>
                            <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200">
                                Reselect
                            </button>
                        </div>

                    </div>
                </div> : ""}
                {updated ? <div className="flex justify-center px-1 mb-3  " >
                    <div className=" w-[95%] rounded-2xl px-8 py-4 text-lg flex justify-between items-center p-4" style={headerStyle}>
                        <button className="px-4 py-2 rounded-xl text-gray-300  hover:bg-gray-600 transition-colors duration-200 border ">
                            Previous
                        </button>

                        <div className="flex gap-2">
                            <button onClick={() => {
                                setIsAddModel(true)
                                sendMessage("focusEditor")
                            }} className="px-4 py-2 rounded-xl text-gray-300  hover:bg-gray-600 transition-colors duration-200 border ">
                                Reselect
                            </button>
                            <button className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200">
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