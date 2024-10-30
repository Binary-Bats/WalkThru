import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { File } from "lucide-react";
import Path from "./Path/Path";
import languageMap from './../utils/languageMap.json';

interface LanguageMap {
    [key: string]: string;
}

function detectLanguage(fileName: string): string {
    const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    const language: LanguageMap = languageMap;
    return language[ext] || "Unknown language";
}

type HighlighterProps = {
    filePath: string;
    content: string;
    startNumber: number;
    endLine: number;
}

export default function Highlighter({ filePath, content, startNumber, endLine }: HighlighterProps) {
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
        },
    };

    const containerStyle = {
        // backgroundColor: 'var(--vscode-editor-background)',
        backgroundColor: "#5B4A1E",
        border: '1px solid var(--vscode-panel-border)',
    };

    const headerStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Light transparency for glassy effect
        color: 'var(--vscode-titleBar-activeForeground)',
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
            <div className="w-[100%]  rounded-xl overflow-hidden bg-[#1e1e1e79]" style={containerStyle}>
                <div className="flex justify-center px-1 mt-3  " >
                    <div className="bg-[#252526] w-[95%] rounded-2xl px-10 py-5 text-lg flex items-center" style={headerStyle}>
                        <File size={16} className="mr-2 text-[#858585]" />
                        <span className=" text-[#858585]"><Path path={filePath} type={"snippet"} startLine={startNumber} endLine={endLine}> {filePath}</Path></span>
                        <span className="ml-auto text-[#3fab53] ">✓✓ Synced</span>
                    </div>
                </div>
                <div className="bg-[#1e1e1e] p-4" style={{
                    backgroundColor: "#5B4A1E",
                }} >
                    <SyntaxHighlighter
                        language={detectLanguage(filePath)}
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