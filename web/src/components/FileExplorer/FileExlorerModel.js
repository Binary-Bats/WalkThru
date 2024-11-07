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
const FileExplorer_1 = __importDefault(require("./FileExplorer"));
const VscodeSendMessage_1 = __importDefault(require("../../utils/VscodeSendMessage"));
const FilterData_1 = __importDefault(require("./FilterData"));
// Memoize FileExplorer component to prevent unnecessary re-renders
const MemoizedFileExplorer = (0, react_1.memo)(FileExplorer_1.default);
const FileExplorerModal = ({ handleAddDocs }) => {
    const [listening, setListening] = (0, react_1.useState)(true);
    const [fileData, setFileData] = (0, react_1.useState)();
    // Memoize the sendMessage function
    const sendMessage = (0, react_1.useCallback)((command, data) => {
        VscodeSendMessage_1.default?.postMessage({
            command: command,
            text: data
        });
        setListening(true);
    }, []);
    // Memoize the handleAdd callback
    const handleAdd = (0, react_1.useCallback)((selectedPath) => {
        console.log(selectedPath, "=============================");
        handleAddDocs(selectedPath, "path");
    }, [handleAddDocs]);
    // Memoize the message handler
    const handleMessage = (0, react_1.useCallback)((event) => {
        const message = event.data;
        if (message.command === "fileStructure") {
            console.log(message);
            // Move the filtering to a web worker if the data is large
            const filteredData = (0, FilterData_1.default)(message.data);
            setFileData(filteredData);
            setListening(false);
        }
    }, []);
    (0, react_1.useEffect)(() => {
        if (!listening)
            return;
        // Only send message if we're listening and don't have fileData
        if (!fileData) {
            sendMessage("getStructure", "t");
        }
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [listening, handleMessage, sendMessage, fileData]);
    // Use React.memo pattern for the modal wrapper
    const modalContent = (0, react_1.useMemo)(() => (fileData ? (<MemoizedFileExplorer handleAdd={handleAdd} data={fileData}/>) : null), [fileData, handleAdd]);
    return (<div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center z-[1000] justify-center p-4">
            {modalContent}
        </div>);
};
// Memoize the entire component to prevent unnecessary re-renders from parent
exports.default = (0, react_1.memo)(FileExplorerModal);
//# sourceMappingURL=FileExlorerModel.js.map