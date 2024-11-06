"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const Path_1 = __importDefault(require("../Path/Path"));
const react_syntax_highlighter_1 = require("react-syntax-highlighter");
const prism_1 = require("react-syntax-highlighter/dist/cjs/styles/prism");
const docs_1 = require("../../redux-store/docs");
const react_redux_1 = require("react-redux");
const languageMap_json_1 = __importDefault(require("../../utils/languageMap.json"));
const languageCache = new Map();
const VscodeSendMessage_1 = __importDefault(require("../../utils/VscodeSendMessage"));
// Memoized custom style object
const customStyle = {
    ...prism_1.oneDark,
    'code[class*="language-"]': {
        ...prism_1.oneDark['code[class*="language-"]'],
        backgroundColor: 'transparent',
        fontFamily: 'var(--vscode-editor-font-family)',
        fontSize: 'var(--vscode-editor-font-size)',
        fontWeight: 'var(--vscode-editor-font-weight)',
    },
    'pre[class*="language-"]': {
        ...prism_1.oneDark['pre[class*="language-"]'],
        backgroundColor: 'transparent',
        margin: 0,
        padding: '1rem',
        scrollbarWidth: "none",
        msOverflowStyle: "none"
    },
};
function detectLanguage(fileName) {
    if (languageCache.has(fileName)) {
        return languageCache.get(fileName);
    }
    const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    const language = languageMap_json_1.default;
    const detectedLanguage = language[ext]?.toLowerCase() || "plaintext";
    languageCache.set(fileName, detectedLanguage);
    return detectedLanguage;
}
const TokenView = ({ item: initialItem }) => {
    const [isHovered, setIsHovered] = (0, react_1.useState)(false);
    const [listening, setListening] = (0, react_1.useState)(false);
    const [item, setItem] = (0, react_1.useState)(initialItem);
    const dispatch = (0, react_redux_1.useDispatch)();
    const docs = (0, react_redux_1.useSelector)((state) => state.docs.docs);
    const handleDelete = (e) => {
        e.stopPropagation();
        dispatch((0, docs_1.deleteBlocksById)(item.id));
    };
    const sendMessage = (command, data) => {
        VscodeSendMessage_1.default?.postMessage({
            command: command,
            data: data
        });
        setListening(true);
    };
    (0, react_1.useEffect)(() => {
        // console.log('Highlighter item changed:', initialItem);
        setItem(initialItem);
    }, [initialItem]);
    (0, react_1.useEffect)(() => {
        if (!listening)
            return;
        // Listen for messages from the extension
        const handleMessage = (event) => {
            const message = event.data;
            if (message.command === 'updatedBlock') {
                console.log("updatedBlock", message.data);
                handleUpdate(message.data, message.command);
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
                setItem(newItem);
                handleUpdate(newItem, message.command);
                setListening(false);
            }
            if (message.command === 'blockState') {
                console.log("blockState", message.data);
            }
        };
        window.addEventListener('message', handleMessage);
        // Clean up the listener when not needed
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [listening]);
    const handleUpdate = (data, command) => {
        let newData;
        if (command === 'updatedBlock') {
            newData = {
                ...data, updated: true
            };
        }
        else if (command === 'select') {
            newData = {
                ...data, outdated: false, obsolete: false
            };
            delete newData['updated'];
            console.log(newData, "inside command select");
            VscodeSendMessage_1.default?.postMessage({
                command: "removeBlockState",
                data: newData
            });
        }
        else {
            newData = data;
        }
        console.log(newData, "newData");
        setItem(newData);
        addToDocs(newData);
    };
    const addToDocs = (item) => {
        function updateBlock(blocks, item, targetId, newData) {
            console.log(item, "[][][][][][][][][][");
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
        });
        console.log(item, "???????????????????????????????");
        dispatch((0, docs_1.updateDocBlocks)(blocks));
    };
    const handleReselect = (e) => {
        e.stopPropagation();
        // Add reselect functionality here
    };
    const backgroundColor = item.outdated ? "#5B4A1E" : item.obsolete ? "#5B1E31" : 'var(--vscode-editor-background)';
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
    return (<div className='mb-5'>

            <div className="relative inline-block w-[100%]">
                {/* Hover Modal */}
                {isHovered && (<div onMouseLeave={(e) => {
                const relatedTarget = e.relatedTarget;
                if (!relatedTarget?.closest('.hover-modal-container')) {
                    setIsHovered(false);
                }
            }} className="hover-modal-container text-white absolute bottom-full left-0 mb-2 w-full z-50">
                        {/* Invisible bridge to maintain hover */}
                        <div className="absolute w-full h-2 bottom-[-8px]"/>

                        <div className="bg-[#5B1E31]  w-[80%] rounded-lg p-3 shadow-xl border border-zinc-700/50 whitespace-nowrap" style={containerStyle}>
                            <div className="flex flex-col justify-center">
                                <div className="flex w-full rounded-xl px-3 py-2 bg-[#351F27] justify-between" style={headerStyle}>
                                    <div className="   px-3 py-1 rounded-md flex items-center gap-2">

                                        <span>{item.data.path} </span>
                                    </div>
                                    {item.outdated ? <span className="ml-auto text-[#ff5c5c] "> ⚠ Out of Sync</span> : item.obsolete ? <span className="ml-auto text-[#ff5c5c] "> 🚫 Obsolete</span> : <span className="ml-auto text-[#3fab53] ">{item.updated ? "✓ Code Tag Updated" : "✓✓ Synced"}</span>}
                                </div>
                                <div className='mt-2 mb-2 px-2 items-center  text-lg flex gap-2'>

                                    <react_syntax_highlighter_1.Prism language={detectLanguage(item.data.path)} style={customStyle} showLineNumbers={true} startingLineNumber={item.data.line_start} wrapLines={true}>
                                        {item.data.text}
                                    </react_syntax_highlighter_1.Prism>
                                </div>
                                {item.outdated ? <div className="flex w-full rounded-xl px-3 py-2 bg-[#351F27] justify-end" style={headerStyle}>
                                    <div className="flex gap-3">

                                        <button onClick={() => {
                    console.log("Update snippet--------", item);
                    sendMessage("update", item);
                }} className="px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200">
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
                                        <button onClick={handleDelete} className="px-2 py-1 rounded-md text-gray-300 hover:bg-zinc-800 transition-colors duration-200 border border-zinc-700">
                                            Reselect
                                        </button>
                                        <button onClick={() => {
                    let nitem = { ...item };
                    delete nitem["updated"];
                    VscodeSendMessage_1.default?.postMessage({
                        command: "removeBlockState",
                        data: nitem
                    });
                    addToDocs(nitem);
                }} className="px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200">
                                            Add to docs
                                        </button>
                                    </div>
                                </div> : ""}

                            </div>
                        </div>
                    </div>)}

                {/* Main File Path Display */}
                <div className={`
                    inline-flex items-center gap-2 p-2 rounded-lg
                    ${item.obsolete
            ? 'bg-red-900/30 text-red-400 border border-red-700/50'
            : 'bg-slate-800 text-white'}
                `} onMouseEnter={() => setIsHovered(true)} onMouseLeave={(e) => {
            const relatedTarget = e.relatedTarget;
            if (!relatedTarget?.closest('.hover-modal-container')) {
                setIsHovered(false);
            }
        }} style={containerStyle}>

                    <Path_1.default path={item.data.path} type={item.type}>
                        {item.data.tag}
                    </Path_1.default>
                    {item.outdated ? <span className="ml-auto text-[#ff5c5c] "> ⚠ </span> : item.obsolete ? <span className="ml-auto text-[#ff5c5c] "> 🚫 </span> : <span className="ml-auto text-[#3fab53] ">{item.updated ? "✓" : "✓✓ "}</span>}


                </div>
            </div>
        </div>);
};
exports.default = TokenView;
//# sourceMappingURL=TockenView.js.map