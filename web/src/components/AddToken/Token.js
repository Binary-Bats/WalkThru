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
const Token = () => {
    const [searchText, setSearchText] = (0, react_1.useState)('');
    const [results, setResults] = (0, react_1.useState)([]);
    const [isSearching, setIsSearching] = (0, react_1.useState)(false);
    const [status, setStatus] = (0, react_1.useState)('');
    const searchTimeoutRef = (0, react_1.useRef)(null);
    const [totalResults, setTotalResults] = (0, react_1.useState)(0);
    const startTimeRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const handleMessage = (event) => {
            const message = event.data;
            switch (message.command) {
                case 'searchResults':
                    setTotalResults(prev => prev + message.results.length);
                    const elapsedTime = ((Date.now() - startTimeRef.current) / 1000).toFixed(1);
                    setStatus(`Found ${totalResults + message.results.length} results in ${elapsedTime}s`);
                    setResults(prev => [...prev, ...message.results]);
                    console.log("results", results);
                    break;
                case 'searchComplete':
                    setIsSearching(false);
                    if (totalResults === 0) {
                        setStatus('No results found');
                    }
                    break;
                case 'searchError':
                    setIsSearching(false);
                    setStatus(`Error: ${message.error}`);
                    break;
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [totalResults]);
    const handleSearch = (text) => {
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
    };
    (0, react_1.useEffect)(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        if (searchText.length > 0) {
            searchTimeoutRef.current = setTimeout(() => {
                handleSearch(searchText);
            }, 200);
        }
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchText]);
    const handleResultClick = (result) => {
        VscodeSendMessage_1.default?.postMessage({
            command: 'openDocs',
            data: {
                path: result.relativePath,
                line: result.line,
                range: result.range
            }
        });
    };
    return (<div className=" bg-gray-900 text-gray-100">
            {/* Header */}
            <div className="border-b border-gray-800 p-4">
                <h1 className="text-xl font-semibold">Select a Path</h1>
            </div>

            {/* Search Bar */}
            <div className="p-4">
                <div className="relative">
                    <div className="relative flex items-center">
                        <lucide_react_1.Search className="absolute left-3 text-gray-400 w-5 h-5"/>
                        <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search File/Folder..." className="w-full py-2 pl-10 pr-4 rounded-md 
                                     bg-gray-800 border border-gray-700 
                                     text-gray-100 placeholder-gray-400
                                     focus:outline-none focus:ring-2 focus:ring-blue-500
                                     focus:border-transparent" autoFocus/>
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="px-4 py-2 flex items-center gap-2 text-sm text-gray-400">
                {isSearching && <lucide_react_1.Loader2 className="w-4 h-4 animate-spin"/>}
                <span>{status}</span>
            </div>

            {/* Results Area */}
            <div className="overflow-auto max-h-[14rem]">
                {/* Project Header */}
                <div className="px-4 py-2 bg-gray-800 flex items-center gap-2">
                    <lucide_react_1.ChevronDown className="w-4 h-4 text-gray-400"/>
                    <span className="text-gray-100">SwiftAuth</span>
                </div>

                {/* Results List */}
                <div className="p-4 space-y-2">
                    {results.map((result, index) => (<div key={`${result.filePath}-${result.line}-${index}`} onClick={() => handleResultClick(result)} className="group cursor-pointer hover:bg-gray-800 rounded-md p-2">
                            <div className="flex items-center gap-2 text-sm mb-1">
                                <lucide_react_1.FileText className="w-4 h-4 text-gray-400"/>
                                <span className="text-gray-300">
                                    {result.relativePath}:{result.line}
                                </span>
                            </div>
                            <pre className="text-sm font-mono pl-6 text-gray-400 overflow-x-auto">
                                {highlightMatch(result.content, result.range)}
                            </pre>
                        </div>))}
                </div>

            </div>
            {/* Bottom Action Button */}
            <div className="bottom-0 w-full p-4 border-t border-gray-800 bg-gray-900">
                <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 
                                 text-white rounded-md transition-colors">
                    Add to Doc
                </button>
            </div>

        </div>);
};
const highlightMatch = (content, range) => {
    const before = content.slice(0, range.start);
    const match = content.slice(range.start, range.end);
    const after = content.slice(range.end);
    return (<>
            {before}
            <span className="bg-yellow-900/50 text-yellow-200 px-1 rounded">
                {match}
            </span>
            {after}
        </>);
};
const getRelativePath = (filePath) => {
    return filePath.split(/[\\/]/).slice(-1).join('/');
};
exports.default = Token;
// import React, { useState, useEffect, useRef } from 'react';
// import { Search, FileText, Loader2 } from 'lucide-react';
// // Get VS Code API
// import vscode from '../../utils/VscodeSendMessage';
// const Token = () => {
//     const [searchText, setSearchText] = useState('');
//     const [results, setResults] = useState([]);
//     const [isSearching, setIsSearching] = useState(false);
//     const [status, setStatus] = useState('');
//     const searchTimeoutRef = useRef(null);
//     const [totalResults, setTotalResults] = useState(0);
//     const startTimeRef = useRef(null);
//     useEffect(() => {
//         const handleMessage = (event) => {
//             const message = event.data;
//             switch (message.command) {
//                 case 'searchResults':
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
//         console.log("Searched function called........", text)
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
//         vscode.postMessage({
//             command: 'openFile',
//             filePath: result.filePath,
//             line: result.line,
//             range: result.range
//         });
//     };
//     return (
//         <div className="max-w-4xl mx-auto p-6">
//             <div className="relative mb-4">
//                 <input
//                     type="text"
//                     value={searchText}
//                     onChange={(e) => setSearchText(e.target.value)}
//                     placeholder="Type to search across workspace..."
//                     className="w-full p-3 pl-10 rounded-md border border-gray-300 dark:border-gray-700 
//                    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
//                    focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     autoFocus
//                 />
//                 <Search className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
//             </div>
//             <div className="flex items-center gap-2 h-8 text-sm text-gray-500 dark:text-gray-400 mb-4">
//                 {isSearching && <Loader2 className="w-4 h-4 animate-spin" />}
//                 <span>{status}</span>
//             </div>
//             <div className="space-y-3">
//                 {results.map((result, index) => (
//                     <div
//                         key={`${result.filePath}-${result.line}-${index}`}
//                         className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 
//                      cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 
//                      transition-colors duration-200"
//                         onClick={() => handleResultClick(result)}
//                     >
//                         <div className="flex justify-between items-center mb-2">
//                             <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
//                                 <FileText className="w-4 h-4" />
//                                 {getRelativePath(result.filePath)}:{result.line}
//                             </div>
//                             <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 
//                            text-blue-700 dark:text-blue-300">
//                                 match
//                             </span>
//                         </div>
//                         <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto 
//                          bg-gray-50 dark:bg-gray-900 p-2 rounded">
//                             {highlightMatch(result.content, result.range)}
//                         </pre>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };
// const highlightMatch = (content, range) => {
//     const before = content.slice(0, range.start);
//     const match = content.slice(range.start, range.end);
//     const after = content.slice(range.end);
//     return (
//         <>
//             {before}
//             <span className="bg-yellow-200 dark:bg-yellow-900 px-1 rounded">{match}</span>
//             {after}
//         </>
//     );
// };
// const getRelativePath = (filePath) => {
//     return filePath.split(/[\\/]/).slice(-2).join('/');
// };
// export default Token;
//# sourceMappingURL=Token.js.map