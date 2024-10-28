import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { File } from "lucide-react";
import Path from "./Path/Path";

type HighlighterProps = {
    filePath: string,
    content: string,
    startNumber: number
    endLine: number
}

export default function Highlighter({ filePath, content, startNumber, endLine }: HighlighterProps) {
    const customStyle = {
        ...oneDark,
        'code[class*="language-"]': {
            ...oneDark['code[class*="language-"]'],
            backgroundColor: 'transparent',
        },
        'pre[class*="language-"]': {
            ...oneDark['pre[class*="language-"]'],
            backgroundColor: 'transparent',
            margin: 0,
        },
    };

    return (
        <div className="flex justify-center mb-5 w-full">
            <div className="w-[100%]  rounded-xl overflow-hidden bg-[#1e1e1e79]">
                <div className="flex justify-center px-1 mt-3 bg-[#1e1e1e] ">
                    <div className="bg-[#252526] w-[90%] rounded-2xl px-7 py-5 flex items-center">
                        <File size={16} className="mr-2 text-[#858585]" />
                        <span className="text-sm text-[#858585]"><Path path={filePath} type={"snippet"} startLine={startNumber} endLine={endLine}> {filePath}</Path></span>
                        <span className="ml-auto text-[#3fab53] text-sm">✓✓ Synced</span>
                    </div>
                </div>
                <div className="bg-[#1e1e1e] p-4">
                    <SyntaxHighlighter
                        language="typescript"
                        style={customStyle}
                        showLineNumbers={true}
                        startingLineNumber={startNumber}
                        wrapLines={true}
                    >
                        {content}
                    </SyntaxHighlighter>
                </div>
            </div>
        </div>
    );
}