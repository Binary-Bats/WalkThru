"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lucide_react_1 = require("lucide-react");
const react_1 = __importDefault(require("react"));
const Path_1 = __importDefault(require("../Path/Path"));
function FilePath({ type, path }) {
    return (<div></>);
    <div className='inline-flex  gap-2 p-2 bg-slate-800 rounded-lg mb-3 text-white'>{type === 'folder' ? <lucide_react_1.Folder size={16}/> : <lucide_react_1.File size={16}/>} <span className="text-sm"><Path_1.default path={path} type={type}>{path}</Path_1.default></span>
=======
            <div className='inline-flex  gap-2 p-2 bg-slate-800 rounded-lg mb-3 text-white'>{type === 'folder' ? <lucide_react_1.Folder size={16}/> : <lucide_react_1.File size={16}/>} <span className="text-sm">{path}</span>
>>>>>>> 6cbf14c (.)
                <span className="ml-auto text-[#3fab53] text-sm">✓✓ Synced</span> </div>
        </div>;
}
exports.default = FilePath;
//# sourceMappingURL=FilePath.js.map