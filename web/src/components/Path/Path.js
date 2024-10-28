"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const VscodeSendMessage_1 = __importDefault(require("../../utils/VscodeSendMessage"));
const Path = ({ children, startLine, endLine, path, type }) => {
    const handleClick = () => {
        if (type !== "folder") {
            VscodeSendMessage_1.default?.postMessage({
                "command": "openDocs",
                "data": { path, startLine, endLine }
            });
        }
    };
    return (<span className=' hover:text-gray-100 cursor-pointer' onClick={handleClick}>{children}</span>);
};
exports.default = Path;
//# sourceMappingURL=Path.js.map