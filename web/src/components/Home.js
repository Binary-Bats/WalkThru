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
const uuid_1 = require("uuid");
const Button_1 = __importDefault(require("./Buttons/Button"));
const Highlighter_1 = __importDefault(require("./Highlighter"));
const VscodeSendMessage_1 = __importDefault(require("../utils/VscodeSendMessage"));
const FileExlorerModel_1 = __importDefault(require("./FileExplorer/FileExlorerModel"));
const FilePath_1 = __importDefault(require("./FilePath/FilePath"));
const AddSnippet_1 = __importDefault(require("./AddSnippetModel/AddSnippet"));
const react_redux_1 = require("react-redux");
const docs_1 = require("../redux-store/docs");
const TokenModel_1 = __importDefault(require("./AddToken/TokenModel"));
const Home = () => {
    const docs = (0, react_redux_1.useSelector)((state) => {
        // Force a new reference for both docs and blocks array
        return {
            ...state.docs.docs,
            blocks: state.docs.docs.blocks.map(block => ({ ...block }))
        };
    });
    const dispatch = (0, react_redux_1.useDispatch)();
    const [title, setTitle] = (0, react_1.useState)(docs.title);
    const [isSaved, setIsSaved] = (0, react_1.useState)(docs.title === "Untitled Docs" ? true : false);
    const [isEditing, setIsEditing] = (0, react_1.useState)(docs.title === "Untitled Docs" ? true : false);
    const [listening, setListening] = (0, react_1.useState)(false);
    const [isFileExOpen, setIsFileExOpen] = (0, react_1.useState)(false);
    const [isAddModel, setIsAddModel] = (0, react_1.useState)(false);
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
        // Listen for messages from the extension
        const handleMessage = (event) => {
            const message = event.data;
            if (message.command === 'select') {
                handleAddDocs(message.data, "snippet");
                setListening(false);
            }
        };
        window.addEventListener('message', handleMessage);
        // Clean up the listener when not needed
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [listening]);
    const handleAddDocs = (data, type) => {
        if (data) {
            console.log("------------------23", data);
            let docItem;
            if (type === "snippet") {
                const codeData = {
                    path: data.file,
                    line_start: data.line,
                    line_end: data.line2,
                    text: data.text
                };
                docItem = {
                    id: (0, uuid_1.v4)(), "outdated": false,
                    "obsolete": false, type, data: codeData
                };
            }
            else {
                docItem = {
                    id: (0, uuid_1.v4)(),
                    "obsolete": false, type, data: data
                };
            }
            if (docs?.blocks) {
                dispatch((0, docs_1.updateDocs)(docItem));
            }
        }
        setIsFileExOpen(false);
    };
    const handleTitleChange = (e) => {
        if (isEditing) {
            setTitle(e.target.value);
            setIsSaved(false);
        }
    };
    const handleSaveClick = () => {
        if (isEditing) {
            setIsSaved(true);
            setIsEditing(false);
            if (docs?.title) {
                console.log("enter------");
                dispatch((0, docs_1.updateTitle)(title));
            }
            else {
                console.log("enter------2");
                let doc = {
                    "title": title,
                    blocks: []
                };
                dispatch((0, docs_1.addDocs)(doc));
            }
            console.log("+{++++++", docs.title);
            console.log('Title saved:', title);
        }
        else {
            setIsEditing(true);
        }
    };
    return (<div className="flex mt-5 mb-5 justify-center w-full">
            <TokenModel_1.default />
            {/* <StateDebugger /> */}
            <div className="w-[90%] rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <input type="text" value={title} onChange={handleTitleChange} className={`bg-transparent text-white text-[4rem] font-bold focus:outline-none ${isEditing ? 'border-blue-500' : 'border-transparent'} pb-1 w-full ${!isEditing && 'cursor-not-allowed'}`} readOnly={!isEditing}/>
                    <Button_1.default onClick={handleSaveClick}> {isEditing ? 'Save' : 'Update'}</Button_1.default>
                </div>

                <div className="border-b border-gray-600 mb-4"></div>
                {docs?.blocks?.map((item) => (item.type === "snippet" ? <Highlighter_1.default key={item.id} item={item}/> : <FilePath_1.default key={item.id} item={item}/>))}

                <div className="inline-flex space-x-2 ring-2 ring-blue-500 rounded-lg p-2">
                    <Button_1.default onClick={() => {
            setIsAddModel(true);
            sendMessage("focusEditor", "t");
        }}>
                        Add Snippet
                    </Button_1.default>
                    <Button_1.default onClick={() => { setIsFileExOpen(true); }}>
                        Add Path
                    </Button_1.default>
                </div>
                {isAddModel ? <AddSnippet_1.default handleAddToDocs={() => {
                sendMessage("alert", "this is test");
                setIsAddModel(false);
            }} handleClose={() => { setIsAddModel(false); }}/> : ""}
                {isFileExOpen ? <FileExlorerModel_1.default handleAddDocs={handleAddDocs}/> : ""}

            </div>
        </div>);
};
exports.default = Home;
//# sourceMappingURL=Home.js.map