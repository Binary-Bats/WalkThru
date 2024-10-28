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
const FileExplorer_1 = __importDefault(require("./FileExplorer")); // Assuming this is your existing File Explorer component
const VscodeSendMessage_1 = __importDefault(require("../../utils/VscodeSendMessage"));
const FilterData_1 = __importDefault(require("./FilterData"));
const FileExplorerModal = ({ handleAddDocs }) => {
    const [listening, setListening] = (0, react_1.useState)(true);
    const [fileData, setFileData] = (0, react_1.useState)();
    const sendMessage = (command, data) => {
        VscodeSendMessage_1.default?.postMessage({
            command: command,
            text: data
        });
        setListening(true);
    };
    (0, react_1.useEffect)(() => {
        if (!listening)
            return;
        sendMessage("getStructure", "t");
        // Listen for messages from the extension
        const handleMessage = (event) => {
            const message = event.data;
            if (message.command === "fileStructure") {
                console.log(message);
                const filteredData = (0, FilterData_1.default)(message.data);
                setFileData(filteredData);
                // Stop listening once the message is received
                setListening(false);
            }
        };
        window.addEventListener('message', handleMessage);
        // Clean up the listener when not needed
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [listening]);
    return (<div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">

            {fileData ? <FileExplorer_1.default handleAdd={(selectedPath) => {
                handleAddDocs(selectedPath, "snippet"); // Call parent function with selected path
            }} data={fileData}/> : ""}
        </div>);
};
exports.default = FileExplorerModal;
//# sourceMappingURL=FileExlorerModel.js.map