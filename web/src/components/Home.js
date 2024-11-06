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
const react_redux_1 = require("react-redux");
const docs_1 = require("../redux-store/docs");
const Button_1 = __importDefault(require("./Buttons/Button"));
const Highlighter_1 = __importDefault(require("./Highlighter"));
const FileExlorerModel_1 = __importDefault(require("./FileExplorer/FileExlorerModel"));
const FilePath_1 = __importDefault(require("./FilePath/FilePath"));
const AddSnippet_1 = __importDefault(require("./AddSnippetModel/AddSnippet"));
const VscodeSendMessage_1 = __importDefault(require("../utils/VscodeSendMessage"));
const TokenModel_1 = __importDefault(require("./AddToken/TokenModel"));
const TockenView_1 = __importDefault(require("./Token/TockenView"));
const Home = () => {
    const dispatch = (0, react_redux_1.useDispatch)();
    // Get the entire docs state to ensure we don't miss updates
    const docs = (0, react_redux_1.useSelector)((state) => state.docs.docs);
    const [localTitle, setLocalTitle] = (0, react_1.useState)(docs.title);
    const [isSaved, setIsSaved] = (0, react_1.useState)(docs.title === "Untitled Docs");
    const [isEditing, setIsEditing] = (0, react_1.useState)(docs.title === "Untitled Docs");
    const [listening, setListening] = (0, react_1.useState)(false);
    const [isFileExOpen, setIsFileExOpen] = (0, react_1.useState)(false);
    const [isAddModel, setIsAddModel] = (0, react_1.useState)(false);
    const [isTokenModel, setIsTokenModel] = (0, react_1.useState)(false);
    // Update local title when docs title changes
    (0, react_1.useEffect)(() => {
        setLocalTitle(docs.title);
    }, [docs.title]);
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
        const handleMessage = (event) => {
            const message = event.data;
            if (message.command === 'select') {
                handleAddDocs(message.data, "snippet");
                setListening(false);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [listening]);
    const handleAddDocs = (data, type) => {
        if (!data) {
            setIsFileExOpen(false);
            return;
        }
        let docItem;
        if (type === "snippet") {
            docItem = {
                id: (0, uuid_1.v4)(),
                outdated: false,
                obsolete: false,
                type,
                data: {
                    path: data.file,
                    line_start: data.line,
                    line_end: data.line2,
                    text: data.text
                }
            };
        }
        else {
            docItem = {
                id: (0, uuid_1.v4)(),
                obsolete: false,
                type,
                data: data
            };
        }
        dispatch((0, docs_1.updateDocs)(docItem));
        setIsFileExOpen(false);
    };
    const handleTitleChange = (e) => {
        if (isEditing) {
            setLocalTitle(e.target.value);
            setIsSaved(false);
        }
    };
    const handleSaveClick = () => {
        if (isEditing) {
            setIsSaved(true);
            setIsEditing(false);
            if (docs.title) {
                dispatch((0, docs_1.updateTitle)(localTitle));
            }
            else {
                dispatch((0, docs_1.addDocs)({ title: localTitle, blocks: [] }));
            }
        }
        else {
            setIsEditing(true);
        }
    };
    // Memoize blocks rendering
    const renderedBlocks = (0, react_1.useMemo)(() => docs.blocks?.map((item) => (item.type === "snippet"
        ? <Highlighter_1.default key={item.id} item={item}/>
        : item.type === "path" ? <FilePath_1.default key={item.id} item={item}/> : <TockenView_1.default key={item.id} item={item}/>)), [docs.blocks]);
    return (<div className="flex mt-5 mb-5 justify-center w-full">
            {isAddModel && (<AddSnippet_1.default handleAddToDocs={() => {
                sendMessage("alert", "this is test");
                setIsAddModel(false);
            }} handleClose={() => setIsAddModel(false)}/>)}
            {isTokenModel && (<TokenModel_1.default handleClose={() => setIsTokenModel(false)}/>)}

            {isFileExOpen && <FileExlorerModel_1.default handleAddDocs={handleAddDocs}/>}

            <div className="w-[90%] rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <input type="text" value={localTitle} onChange={handleTitleChange} className={`bg-transparent text-white text-[2rem] sm:text-[2.5rem] md:text-[3rem] lg:text-[3.5rem] xl:text-[4rem] font-bold focus:outline-none 
                            ${isEditing ? 'border-blue-500' : 'border-transparent'}
                            pb-1 w-full ${!isEditing && 'cursor-not-allowed'}`} readOnly={!isEditing}/>
                    <Button_1.default onClick={handleSaveClick}>
                        {isEditing ? 'Save' : 'Update'}
                    </Button_1.default>
                </div>

                <div className="border-b border-gray-600 mb-4"/>

                {renderedBlocks}

                <div className="inline-flex space-x-2 ring-2 ring-blue-500 rounded-lg p-2">
                    <Button_1.default onClick={() => {
            setIsAddModel(true);
            sendMessage("focusEditor", "t");
        }}>
                        Add Snippet
                    </Button_1.default>
                    <Button_1.default onClick={() => setIsFileExOpen(true)}>
                        Add Path
                    </Button_1.default>
                    <Button_1.default onClick={() => setIsTokenModel(true)}>
                        Add Token
                    </Button_1.default>
                </div>
            </div>
        </div>);
};
exports.default = Home;
//# sourceMappingURL=Home.js.map