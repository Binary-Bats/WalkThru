import React, { useEffect, useState } from 'react';
import { AlertTriangleIcon, Check, CheckCheck, CircleSlash, FileIcon, FolderIcon, RefreshCw, Search, TriangleAlert } from 'lucide-react';
import Path from '../Path/Path';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
// import SyntaxHighlighter from 'react-syntax-highlighter';
// import { atomOneDarkReasonable as oneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { deleteBlocksById, updateDocBlocks } from '../../redux-store/docs';
import FileExlorerModel from '../FileExplorer/FileExlorerModel';
import { useDispatch, useSelector } from 'react-redux';
import { addDocs, updateDocs, updateTitle } from '../../redux-store/docs';
import { AppState } from '../../redux-store/docStore';
import languageMap from '../../utils/languageMap.json';
const languageCache = new Map<string, string>();
import vscode from '../../utils/VscodeSendMessage';
import TokenModel from '../AddToken/TokenModel';
interface LanguageMap {
    [key: string]: string;
}

// Memoized custom style object
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
        padding: '0.5rem',
        scrollbarWidth: "none",
        msOverflowStyle: "none"
    },
};
function detectLanguage(fileName: string): string {
    if (languageCache.has(fileName)) {
        return languageCache.get(fileName)!;
    }
    const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    const language: LanguageMap = languageMap;
    const detectedLanguage = language[ext]?.toLowerCase() || "plaintext";
    languageCache.set(fileName, detectedLanguage);
    return detectedLanguage;
}
type PathData = {
    "text": string,
    "line_start": number,
    "line_end": number,
    "range?": {
        "start": number,
        "end": number
    },
    "path": string,
    "tag": string,

};

type FilePathItem = {
    id: string,
    obsolete: boolean,
    outdated: boolean,
    updated?: boolean,
    type: "token",
    data: PathData
};

type FilePathProps = {
    item: FilePathItem,
};

const TokenView: React.FC<FilePathProps> = ({ item: initialItem }) => {
    const [isHovered, setIsHovered] = useState(false);

    const [listening, setListening] = useState(false);
    const [item, setItem] = useState(initialItem);
    const [isSearchModelOpen, setIsSearchModelOpen] = useState(false);
    const [previewItem, setPreviewItem] = useState(null);
    const dispatch = useDispatch();
    const docs = useSelector((state: AppState) => state.docs.docs);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(deleteBlocksById(item.id));
    };

    const sendMessage = (command: string, data?: any) => {
        vscode?.postMessage({
            command: command,
            data: data
        });
        setListening(true);
    };


    useEffect(() => {
        // console.log('Highlighter item changed:', initialItem);
        setPreviewItem(null)
        setItem(initialItem)
        if (initialItem.updated) {
            if (!initialItem.obsolete) {
                sendMessage("getBlockState", initialItem)
            }
        }

    }, [initialItem]);



    useEffect(() => {

        if (!listening) return;
        // Listen for messages from the extension
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;

            if (message.command === 'updatedBlock') {

                console.log("Message Data after", message.data)
                handleUpdate(message.data, message.command)

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
            if (message.command === 'prevCode') {
                console.log("blockState", message.data)
                if (message.data.state.id === item.id) {

                    setPreviewItem(message.data.state)
                }

            }
        };

        window.addEventListener('message', handleMessage);

        // Clean up the listener when not needed
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [listening]);
    const handleUpdate = (data: FilePathItem, command?: string) => {
        let newData
        if (command === 'updatedBlock') {
            newData = {
                ...data, updated: true
            }
        } else if (command === 'select') {
            newData = {
                ...data, outdated: false, obsolete: false
            }
            delete newData['updated']
            console.log(newData, "inside command select")
            vscode?.postMessage({
                command: "removeBlockState",
                data: newData
            });
        } else {
            newData = data
        }
        console.log(newData, "newData")
        setItem(newData)
        addToDocs(newData)


    };

    const addToDocs = (item?: any) => {
        function updateBlock(blocks: any, item: FilePathItem, targetId: string, newData: Snippet) {
            console.log(item, "[][][][][][][][][][")
            return blocks.map(block => {
                // Check if the block is of type 'snippet' and has a matching ID
                if (block.type === 'token' && block.id === targetId) {
                    return {
                        ...block,
                        outdated: item.updated ? false : item.outdated,
                        obsolete: item.obsolete,
                        ...(item.updated ? { updated: true } : { updated: undefined }),
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
        let blocks = updateBlock(docs.blocks, item, item.id, {
            path: item.data.path,
            line_start: item.data.line_start,
            line_end: item.data.line_end,
            text: item.data.text,
            tag: item.data.tag,
            range: item.data.range
        })


        dispatch(updateDocBlocks(blocks))


    }

    const handleReselect = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSearchModelOpen(true);

        // Add reselect functionality here
    };



    const backgroundColor = item.outdated ? "#5B4A1E" : item.obsolete ? "#5B1E31" : 'var(--vscode-editor-background)'

    const containerStyle = {
        backgroundColor: backgroundColor,
        // backgroundColor: "#5B4A1E",
        border: '1px solid var(--vscode-panel-border)',
    };

    const headerStyle = {
        // backgroundColor: 'rgba(80, 80, 90, 0.5)', // Light transparency for glassy effect
        backgroundColor: item.outdated ? "rgba(53, 51, 31, 1)" : item.obsolete ? 'rgba(53, 31, 39, 1)' : 'rgba(40, 48, 71, 1)',
        color: 'var(--vscode-titleBar-foreground)',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)', // Soft shadow for floating effect
        backdropFilter: 'blur(8px)', // Frosted glass effect


        // borderRadius: '8px', // Rounded corners for smooth look
    };


    return (
        <div className='mb-5'>
            {isSearchModelOpen ? <TokenModel id={item.id} handleClose={() => setIsSearchModelOpen(false)} /> : null}

            <div className="relative  inline-block w-[100%]">
                {/* Hover Modal */}
                {isHovered && (
                    <div onMouseLeave={(e) => {
                        const relatedTarget = e.relatedTarget as HTMLElement;
                        if (!relatedTarget?.closest('.hover-modal-container')) {
                            setIsHovered(false);
                        }
                    }} className="hover-modal-container  text-white absolute bottom-full left-0 mb-2 w-full z-[2000]">
                        {/* Invisible bridge to maintain hover */}
                        <div className="absolute w-full h-2 bottom-[-8px]" />

                        <div className="bg-[#5B1E31]  w-[80%] rounded-xl p-3 shadow-xl border border-zinc-700/50 whitespace-nowrap" style={containerStyle}>
                            <div className="flex flex-col justify-center">
                                <div className="flex w-full rounded-xl px-4 py-3 bg-[#351F27] justify-between" style={headerStyle}>
                                    <div className=" rounded-md flex items-center gap-2">

                                        <span className='flex gap-2 items-center'><FileIcon className="w-4 h-4" size={16} /><Path path={item.data.path} type={item.type} startLine={item.data.line_start} endLine={item.data.line_end}>
                                            {item.data.path}
                                        </Path> </span>
                                    </div>
                                    {item.outdated ? <span className="ml-auto flex gap-2 items-center text-[#FFB284] "> <TriangleAlert className="w-4 h-4" size={16} /> Out of Sync</span> : item.obsolete ? <span className="ml-auto flex gap-2 items-center text-[#ff5c5c] "> <CircleSlash className='w-4 h-4' size={16} /> Obsolete</span> : <span className="ml-auto text-[#3fab53] ">{item.updated ? <span className='flex gap-2 items-center'><Check className="w-4 h-4" size={16} />Code Tag Updated</span> : <span className='flex gap-2 items-center'><CheckCheck className="w-4 h-4" size={16} /> Synced</span>}</span>}
                                </div>
                                <div className='mt-2 mb-2 pr-2 flex flex-col'>
                                    {previewItem && (
                                        <div className="w-full">
                                            <SyntaxHighlighter
                                                language={detectLanguage(item.data.path)}
                                                style={customStyle}
                                                showLineNumbers={true}
                                                startingLineNumber={previewItem.data.line_start}
                                                wrapLines={true}
                                            >
                                                {previewItem.data.text}
                                            </SyntaxHighlighter>
                                        </div>
                                    )}
                                    <div className="w-full">
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
                                </div>
                                {item.outdated ? <div className="flex w-full rounded-xl px-3 py-2 bg-[#351F27] justify-end" style={headerStyle}>
                                    <div className="flex gap-3">

                                        <button onClick={() => {

                                            sendMessage("update", item)
                                        }} className="px-2 py-[2px] rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200">
                                            Update
                                        </button>
                                    </div>
                                </div> : ""}
                                {item.obsolete ? <div className="flex w-full rounded-xl px-3 py-2 bg-[#351F27] justify-end" style={headerStyle}>
                                    <div className="flex gap-3">
                                        <button onClick={handleDelete} className="px-2 py-1 rounded-md text-gray-300 hover:bg-zinc-800 transition-colors duration-200 border border-zinc-700">
                                            Remove
                                        </button>
                                        <button onClick={handleReselect} className="px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200">
                                            Reselect
                                        </button>
                                    </div>
                                </div> : item.updated ? <div className="flex w-full rounded-xl px-3 py-2 bg-[#351F27] justify-end" style={headerStyle}>
                                    <div className="flex gap-3">
                                        <button onClick={handleReselect} className="px-2 py-1 rounded-md text-gray-300 hover:bg-zinc-800 transition-colors duration-200 border border-zinc-700">
                                            Reselect
                                        </button>
                                        <button onClick={() => {
                                            let nitem = { ...item }
                                            delete nitem["updated"]
                                            vscode?.postMessage({
                                                command: "removeBlockState",
                                                data: nitem
                                            });
                                            addToDocs(nitem)
                                        }} className="px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200">
                                            Add to docs
                                        </button>
                                    </div>
                                </div> : ""}

                            </div>
                        </div>
                    </div>
                )}

                <div className='inline-flex items-center px-2 rounded-lg text-md font-semibold' style={containerStyle}>
                    {/* Main File Path Display */}
                    <div
                        className={`
                    inline-flex items-center gap-2 p-2 rounded-lg text-md font-semibold
                    
                `}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={(e) => {
                            const relatedTarget = e.relatedTarget as HTMLElement;
                            if (!relatedTarget?.closest('.hover-modal-container')) {
                                setIsHovered(false);
                            }
                        }}



                    >
                        <div

                        >
                            <Path path={item.data.path} type={item.type} startLine={item.data.line_start} endLine={item.data.line_end}>
                                {item.data.tag}
                            </Path>
                        </div>





                    </div>
                    {item.outdated ? <span className="ml-auto  " onClick={() => {

                        sendMessage("update", item)
                    }}> <RefreshCw className="w-4 h-4 text-[#FFB284] cursor-pointer hover:rotate-45" size={16} /></span> : item.obsolete ? <span className="ml-auto text-[#ff5c5c] "> <CircleSlash className='w-4 h-4' size={16} /> </span> : <span className="ml-auto text-[#3fab53] ">{item.updated ? <span><Check className="w-4 h-4" size={16} /></span> : <CheckCheck className="w-4 h-4" size={16} />}</span>}
                </div>
            </div>
        </div>
    );
};

export default TokenView;

