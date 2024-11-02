import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Loader2, ChevronDown } from 'lucide-react';
import vscode from '../../utils/VscodeSendMessage';

const Token = () => {
    const [searchText, setSearchText] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [status, setStatus] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const searchTimeoutRef = useRef(null);
    const [totalResults, setTotalResults] = useState(0);
    const startTimeRef = useRef(null);
    const [workspaceName, setWorkspaceName] = useState(null);

    useEffect(() => {
        const handleMessage = (event) => {
            const message = event.data;

            switch (message.command) {
                case 'searchResults':
                    setWorkspaceName(message.workspace);
                    setTotalResults(prev => prev + message.results.length);
                    const elapsedTime = ((Date.now() - startTimeRef.current) / 1000).toFixed(1);
                    setStatus(`Found ${totalResults + message.results.length} results in ${elapsedTime}s`);
                    setResults(prev => [...prev, ...message.results]);
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

        vscode?.postMessage({
            command: 'search',
            text: text
        });
    };

    useEffect(() => {
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
        setSelectedItem(result);
    };

    return (
        <div className="w-[90%] bg-gray-900 text-gray-100 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-800 p-4">
                <h1 className="text-2xl font-semibold">Select a Path</h1>
            </div>

            {/* Search Bar */}
            <div className="p-4">
                <div className="relative">
                    <div className="relative flex items-center">
                        <Search className="absolute left-3 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Search File/Folder..."
                            className="w-full py-2 pl-10 pr-4 rounded-md 
                                     bg-gray-800 border border-gray-700 
                                     text-gray-100 placeholder-gray-400
                                     focus:outline-none focus:ring-2 focus:ring-blue-500
                                     focus:border-transparent"
                            autoFocus
                        />
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="px-4 py-2 flex items-center gap-2 text-sm text-gray-400">
                {isSearching && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{status}</span>
            </div>

            {/* Workspace Header */}
            <div className="px-4 py-2 bg-gray-800 flex items-center gap-2">
                <ChevronDown className="w-4 h-4 text-gray-400" />
                <span className="text-gray-100">{workspaceName}</span>
            </div>

            {/* Results Area */}
            <div className="overflow-auto max-h-[14rem]">
                <div className="p-4 space-y-2">
                    {results.map((result, index) => (
                        <div
                            key={`${result.filePath}-${result.line}-${index}`}
                            onClick={() => handleResultClick(result)}
                            className={`group cursor-pointer rounded-md p-2 transition-colors
                                      ${selectedItem === result ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
                        >
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    {/* Highlighted content first */}
                                    <div className="text-sm text-gray-300 font-medium mb-1">
                                        {result.content.split('\n')[0].trim()}
                                    </div>
                                    {/* Path and line number below */}
                                    <div className="text-xs text-gray-400 truncate">
                                        {result.relativePath}:
                                        <span className="text-blue-400">
                                            {result.line}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Preview Section */}
            {selectedItem && (
                <div className="border-t border-gray-800 p-4 bg-gray-850">
                    <div className="text-sm mb-2 text-gray-400">Preview:</div>
                    <div className="bg-gray-800 rounded-md p-3 text-sm font-mono">
                        <pre className="whitespace-pre-wrap text-gray-200">
                            {selectedItem.content}
                        </pre>
                    </div>
                </div>
            )}

            {/* Bottom Action Button */}
            <div className="bottom-0 w-full p-4 border-t border-gray-800 bg-gray-900">
                <button
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 
                              text-white rounded-md transition-colors"
                    disabled={!selectedItem}
                >
                    Add to Doc
                </button>
            </div>
        </div>
    );
};

export default Token;