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
const lucide_react_1 = require("lucide-react");
const VscodeSendMessage_1 = __importDefault(require("../../utils/VscodeSendMessage"));
const react_syntax_highlighter_1 = require("react-syntax-highlighter");
const prism_1 = require("react-syntax-highlighter/dist/cjs/styles/prism");
const react_redux_1 = require("react-redux");
const docs_1 = require("../../redux-store/docs");
const languageMap_json_1 = __importDefault(require("../../utils/languageMap.json"));
const uuid_1 = require("uuid");
// Memoize language detection
const languageCache = new Map();
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
// Memoized Result Item Component
const ResultItem = react_1.default.memo(({ result, isSelected, onClick }) => (<div onClick={onClick} className={`group cursor-pointer rounded-md p-2 transition-colors
                  ${isSelected ? 'bg-gray-700' : 'hover:bg-gray-800'}`}>
        <div className="flex items-center gap-2">
            <lucide_react_1.FileText className="w-4 h-4 text-gray-400 flex-shrink-0"/>
            <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-300 font-medium mb-1">
                    {result.content}
                </div>
                <div className="text-xs text-gray-400 truncate">
                    {result.relativePath}:
                    <span className="text-blue-400">
                        {result.line}
                    </span>
                </div>
            </div>
        </div>
    </div>));
const Token = ({ handleClose }) => {
    const [searchText, setSearchText] = (0, react_1.useState)('');
    const [results, setResults] = (0, react_1.useState)([]);
    const [isSearching, setIsSearching] = (0, react_1.useState)(false);
    const [status, setStatus] = (0, react_1.useState)('');
    const [selectedItem, setSelectedItem] = (0, react_1.useState)(null);
    const searchTimeoutRef = (0, react_1.useRef)(null);
    const [totalResults, setTotalResults] = (0, react_1.useState)(0);
    const startTimeRef = (0, react_1.useRef)(null);
    const [workspaceName, setWorkspaceName] = (0, react_1.useState)(null);
    const dispatch = (0, react_redux_1.useDispatch)();
    // Get the entire docs state to ensure we don't miss updates
    const docs = (0, react_redux_1.useSelector)((state) => state.docs.docs);
    const handleAddDocs = () => {
        if (!selectedItem) {
            handleClose();
            return;
        }
        // let docItem: CodeDocs;
        // if (type === "snippet") {
        //     docItem = {
        //         id: uuidv4(),
        //         outdated: false,
        //         obsolete: false,
        //         type,
        //         data: {
        //             path: data.file,
        //             line_start: data.line,
        //             line_end: data.line2,
        //             text: data.text
        //         }
        //     };
        // } else {
        //     docItem = {
        //         id: uuidv4(),
        //         obsolete: false,
        //         type,
        //         data: data as Path
        //     };
        // }
        let token = {
            id: (0, uuid_1.v4)(),
            obsolete: false,
            outdated: false,
            type: "token",
            data: {
                text: selectedItem.content,
                line_start: selectedItem.line,
                line_end: selectedItem.line,
                range: selectedItem.range,
                path: selectedItem.relativePath,
                tag: selectedItem.token
            }
        };
        dispatch((0, docs_1.updateDocs)(token));
    };
    const handleMessage = (0, react_1.useCallback)((event) => {
        const message = event.data;
        switch (message.command) {
            case 'searchResults':
                setWorkspaceName(message.workspace);
                setTotalResults(prev => {
                    const newTotal = prev + message.results.length;
                    const elapsedTime = ((Date.now() - startTimeRef.current) / 1000).toFixed(1);
                    setStatus(`Found ${newTotal} results in ${elapsedTime}s`);
                    return newTotal;
                });
                setResults(prev => [...prev, ...message.results]);
                break;
            case 'searchComplete':
                setIsSearching(false);
                setTotalResults(prev => {
                    if (prev === 0) {
                        setStatus('No results found');
                    }
                    return prev;
                });
                break;
            case 'searchError':
                setIsSearching(false);
                setStatus(`Error: ${message.error}`);
                break;
        }
    }, []);
    (0, react_1.useEffect)(() => {
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleMessage]);
    // Debounced search function
    const debouncedSearch = (0, react_1.useCallback)((text) => {
        if (!text) {
            setResults([]);
            setStatus('');
            return;
        }
        setIsSearching(true);
        setResults([]);
        setTotalResults(0);
        startTimeRef.current = Date.now();
        setStatus('Searching...');
        VscodeSendMessage_1.default?.postMessage({
            command: 'search',
            text: text
        });
    }, []);
    // Debounced search input handler
    (0, react_1.useEffect)(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        if (searchText.length > 1) {
            searchTimeoutRef.current = setTimeout(() => {
                debouncedSearch(searchText);
            }, 300);
        }
        else {
            setResults([]);
            setStatus('');
        }
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchText, debouncedSearch]);
    const handleResultClick = (0, react_1.useCallback)((result) => {
        setSelectedItem(result);
    }, []);
    return (<div className="w-[90%] bg-gray-900 text-gray-100 rounded-2xl overflow-hidden">
            <div className="border-b border-gray-800 p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold">Select a Token</h1>
                    <button onClick={handleClose} className="p-1 hover:bg-gray-800 rounded-full transition-colors">
                        <lucide_react_1.X className="w-5 h-5 text-gray-400 hover:text-gray-200"/>
                    </button>
                </div>
            </div>

            <div className="p-4">
                <div className="relative flex items-center">
                    <lucide_react_1.Search className="absolute left-3 text-gray-400 w-5 h-5"/>
                    <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search File/Folder..." className="w-full py-2 pl-10 pr-4 rounded-md 
                                 bg-gray-800 border border-gray-700 
                                 text-gray-100 placeholder-gray-400
                                 focus:outline-none focus:ring-2 focus:ring-blue-500
                                 focus:border-transparent" autoFocus/>
                </div>
            </div>

            <div className="px-4 py-2 flex items-center gap-2 text-sm text-gray-400">
                {isSearching && <lucide_react_1.Loader2 className="w-4 h-4 animate-spin"/>}
                <span>{status}</span>
            </div>

            <div className="px-4 py-2 bg-gray-800 flex items-center gap-2">
                <lucide_react_1.ChevronDown className="w-4 h-4 text-gray-400"/>
                <span className="text-gray-100">{workspaceName}</span>
            </div>

            <div className="overflow-auto max-h-[14rem]">
                <div className="p-4 space-y-2">
                    {results.map((result, index) => (<ResultItem key={`${result.filePath}-${result.line}-${index}`} result={result} isSelected={selectedItem === result} onClick={() => handleResultClick(result)}/>))}
                </div>
            </div>

            {selectedItem && (<div className="border-t border-gray-800 p-4 bg-gray-850">
                    <div className="text-sm mb-2 text-gray-400">Preview: {selectedItem.relativePath}</div>
                    <div className="bg-gray-800 rounded-md p-3 text-sm font-mono">
                        <react_syntax_highlighter_1.Prism language={detectLanguage(selectedItem.relativePath)} style={customStyle} showLineNumbers={true} startingLineNumber={selectedItem.line} wrapLines={true}>
                            {selectedItem.content}
                        </react_syntax_highlighter_1.Prism>
                    </div>
                </div>)}

            <div className="bottom-0 w-full p-4 border-t border-gray-800 bg-gray-900">
                <button onClick={() => {
            handleAddDocs();
            handleClose();
        }} className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 
                              text-white rounded-md transition-colors" disabled={!selectedItem}>
                    Add to Doc
                </button>
            </div>
        </div>);
};
exports.default = Token;
// import React, { useState, useEffect, useRef } from 'react';
// import { Search, FileText, Loader2, ChevronDown } from 'lucide-react';
// import vscode from '../../utils/VscodeSendMessage';
// import { Console } from 'console';
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
// import languageMap from '../../utils/languageMap.json';
// interface LanguageMap {
//     [key: string]: string;
// }
// function detectLanguage(fileName: string): string {
//     const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
//     console.log(ext)
//     const language: LanguageMap = languageMap;
//     return language[ext]?.toLowerCase() || "Unknown language";
// }
// const Token = () => {
//     const [searchText, setSearchText] = useState('');
//     const [results, setResults] = useState([]);
//     const [isSearching, setIsSearching] = useState(false);
//     const [status, setStatus] = useState('');
//     const [selectedItem, setSelectedItem] = useState(null);
//     const searchTimeoutRef = useRef(null);
//     const [totalResults, setTotalResults] = useState(0);
//     const startTimeRef = useRef(null);
//     const [workspaceName, setWorkspaceName] = useState(null);
//     useEffect(() => {
//         const handleMessage = (event) => {
//             const message = event.data;
//             switch (message.command) {
//                 case 'searchResults':
//                     setWorkspaceName(message.workspace);
//                     setTotalResults(prev => prev + message.results.length);
//                     const elapsedTime = ((Date.now() - startTimeRef.current) / 1000).toFixed(1);
//                     setStatus(`Found ${totalResults + message.results.length} results in ${elapsedTime}s`);
//                     setResults(prev => [...prev, ...message.results]);
//                     break;
//                 case 'searchComplete':
//                     setIsSearching(false);
//                     if (totalResults === 0) {
//                         setStatus('No results found');
//                     }
//                     break;
//                 case 'searchError':
//                     setIsSearching(false);
//                     setStatus(`Error: ${message.error}`);
//                     break;
//             }
//         };
//         window.addEventListener('message', handleMessage);
//         return () => window.removeEventListener('message', handleMessage);
//     }, [totalResults]);
//     const handleSearch = (text) => {
//         if (!text) {
//             setResults([]);
//             setStatus('');
//             return;
//         }
//         setIsSearching(true);
//         setResults([]);
//         setTotalResults(0);
//         startTimeRef.current = Date.now();
//         setStatus('Searching...');
//         vscode?.postMessage({
//             command: 'search',
//             text: text
//         });
//     };
//     useEffect(() => {
//         if (searchTimeoutRef.current) {
//             clearTimeout(searchTimeoutRef.current);
//         }
//         if (searchText.length > 0) {
//             searchTimeoutRef.current = setTimeout(() => {
//                 handleSearch(searchText);
//             }, 200);
//         }
//         return () => {
//             if (searchTimeoutRef.current) {
//                 clearTimeout(searchTimeoutRef.current);
//             }
//         };
//     }, [searchText]);
//     const handleResultClick = (result) => {
//         setSelectedItem(result);
//     };
//     const customStyle = {
//         ...oneDark,
//         'code[class*="language-"]': {
//             ...oneDark['code[class*="language-"]'],
//             backgroundColor: 'transparent',
//             fontFamily: 'var(--vscode-editor-font-family)',
//             fontSize: 'var(--vscode-editor-font-size)',
//             fontWeight: 'var(--vscode-editor-font-weight)',
//         },
//         'pre[class*="language-"]': {
//             ...oneDark['pre[class*="language-"]'],
//             backgroundColor: 'transparent',
//             margin: 0,
//             padding: '1rem',
//             scrollbarWidth: "none",  // For Firefox
//             msOverflowStyle: "none"  // For Internet Explorer and Edge
//         },
//     };
//     return (
//         <div className="w-[90%] bg-gray-900 text-gray-100 rounded-2xl overflow-hidden">
//             {/* Header */}
//             <div className="border-b border-gray-800 p-4">
//                 <h1 className="text-2xl font-semibold">Select a Token</h1>
//             </div>
//             {/* Search Bar */}
//             <div className="p-4">
//                 <div className="relative">
//                     <div className="relative flex items-center">
//                         <Search className="absolute left-3 text-gray-400 w-5 h-5" />
//                         <input
//                             type="text"
//                             value={searchText}
//                             onChange={(e) => setSearchText(e.target.value)}
//                             placeholder="Search File/Folder..."
//                             className="w-full py-2 pl-10 pr-4 rounded-md 
//                                      bg-gray-800 border border-gray-700 
//                                      text-gray-100 placeholder-gray-400
//                                      focus:outline-none focus:ring-2 focus:ring-blue-500
//                                      focus:border-transparent"
//                             autoFocus
//                         />
//                     </div>
//                 </div>
//             </div>
//             {/* Status Bar */}
//             <div className="px-4 py-2 flex items-center gap-2 text-sm text-gray-400">
//                 {isSearching && <Loader2 className="w-4 h-4 animate-spin" />}
//                 <span>{status}</span>
//             </div>
//             {/* Workspace Header */}
//             <div className="px-4 py-2 bg-gray-800 flex items-center gap-2">
//                 <ChevronDown className="w-4 h-4 text-gray-400" />
//                 <span className="text-gray-100">{workspaceName}</span>
//             </div>
//             {/* Results Area */}
//             <div className="overflow-auto max-h-[14rem]">
//                 <div className="p-4 space-y-2">
//                     {results.map((result, index) => (
//                         <div
//                             key={`${result.filePath}-${result.line}-${index}`}
//                             onClick={() => handleResultClick(result)}
//                             className={`group cursor-pointer rounded-md p-2 transition-colors
//                                       ${selectedItem === result ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
//                         >
//                             <div className="flex items-center gap-2">
//                                 <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
//                                 <div className="flex-1 min-w-0">
//                                     {/* Highlighted content first */}
//                                     <div className="text-sm text-gray-300 font-medium mb-1">
//                                         {result.content}
//                                     </div>
//                                     {/* Path and line number below */}
//                                     <div className="text-xs text-gray-400 truncate">
//                                         {result.relativePath}:
//                                         <span className="text-blue-400">
//                                             {result.line}
//                                         </span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//             {/* Preview Section */}
//             {selectedItem && (
//                 <div className="border-t border-gray-800 p-4 bg-gray-850">
//                     <div className="text-sm mb-2 text-gray-400">Preview: {selectedItem.relativePath}</div>
//                     <div className="bg-gray-800 rounded-md p-3 text-sm font-mono">
//                         <pre className="whitespace-pre-wrap text-gray-200">
//                             <SyntaxHighlighter
//                                 language={detectLanguage(selectedItem.relativePath)}
//                                 style={customStyle}
//                                 showLineNumbers={true}
//                                 startingLineNumber={selectedItem.line}
//                                 wrapLines={true}
//                             >
//                                 {selectedItem.content}
//                             </SyntaxHighlighter>
//                         </pre>
//                     </div>
//                 </div>
//             )}
//             {/* Bottom Action Button */}
//             <div className="bottom-0 w-full p-4 border-t border-gray-800 bg-gray-900">
//                 <button onClick={() => console.log(selectedItem)}
//                     className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 
//                               text-white rounded-md transition-colors"
//                     disabled={!selectedItem}
//                 >
//                     Add to Doc
//                 </button>
//             </div>
//         </div>
//     );
// };
// export default Token;
//# sourceMappingURL=Token.js.map