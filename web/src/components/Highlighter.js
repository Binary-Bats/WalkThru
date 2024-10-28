"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Highlighter;
const react_1 = __importDefault(require("react"));
const react_syntax_highlighter_1 = require("react-syntax-highlighter");
const prism_1 = require("react-syntax-highlighter/dist/cjs/styles/prism");
const lucide_react_1 = require("lucide-react");
const Path_1 = __importDefault(require("./Path/Path"));
function Highlighter({ filePath, content, startNumber, endLine }) {
    const customStyle = {
        ...prism_1.oneDark,
        'code[class*="language-"]': {
            ...prism_1.oneDark['code[class*="language-"]'],
            backgroundColor: 'transparent',
        },
        'pre[class*="language-"]': {
            ...prism_1.oneDark['pre[class*="language-"]'],
            backgroundColor: 'transparent',
            margin: 0,
        },
    };
    return (<div className="flex justify-center mb-5 w-full">
            <div className="w-[100%]  rounded-xl overflow-hidden bg-[#1e1e1e79]">
                <div className="flex justify-center px-1 mt-3 bg-[#1e1e1e] ">
                    <div className="bg-[#252526] w-[90%] rounded-2xl px-7 py-5 flex items-center">
                        <lucide_react_1.File size={16} className="mr-2 text-[#858585]"/>
                        <span className="text-sm text-[#858585]"><Path_1.default path={filePath} type={"snippet"} startLine={startNumber} endLine={endLine}> {filePath}</Path_1.default></span>
                        <span className="ml-auto text-[#3fab53] text-sm">✓✓ Synced</span>
                    </div>
                </div>
                <div className="bg-[#1e1e1e] p-4">
                    <react_syntax_highlighter_1.Prism language="typescript" style={customStyle} showLineNumbers={true} startingLineNumber={startNumber} wrapLines={true}>
                        {content}
                    </react_syntax_highlighter_1.Prism>
                </div>
            </div>
        </div>);
}
//# sourceMappingURL=Highlighter.js.map