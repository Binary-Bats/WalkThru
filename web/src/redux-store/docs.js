"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.setState = exports.updateDocBlocks = exports.updateTitle = exports.updateDocs = exports.addDocs = exports.docSlice = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const VscodeSendMessage_1 = __importDefault(require("../utils/VscodeSendMessage"));
const uuid_1 = require("uuid");
// Helper function to load docs from session storage
const loadState = () => {
    const previousState = VscodeSendMessage_1.default?.getState();
    return (previousState?.docs ||
        window.initialData || { id: (0, uuid_1.v4)(), title: "Untitled Docs", blocks: [] });
};
const sendMessage = (docs) => {
    VscodeSendMessage_1.default?.postMessage({
        command: "saveDocs",
        data: JSON.parse(JSON.stringify(docs)),
    });
};
// Helper function to save docs to session storage
const saveState = (docs) => {
    VscodeSendMessage_1.default?.setState({ docs });
};
// Redux slice
exports.docSlice = (0, toolkit_1.createSlice)({
    name: "docstate",
    initialState: {
        docs: loadState(),
    },
    reducers: {
        addDocs: (state, action) => {
            state.docs = action.payload;
            saveState(state.docs);
            sendMessage(state);
        },
        updateDocs: (state, action) => {
            state.docs.blocks.push(action.payload);
            saveState(state.docs);
            sendMessage(state);
        },
        updateDocBlocks: (state, action) => {
            state.docs.blocks = action.payload;
            saveState(state.docs);
            sendMessage(state);
        },
        updateTitle: (state, action) => {
            state.docs.title = action.payload;
            saveState(state.docs);
            sendMessage(state);
        },
        setState: (state, action) => {
            state.docs = action.payload;
        },
    },
});
_a = exports.docSlice.actions, exports.addDocs = _a.addDocs, exports.updateDocs = _a.updateDocs, exports.updateTitle = _a.updateTitle, exports.updateDocBlocks = _a.updateDocBlocks, exports.setState = _a.setState;
exports.default = exports.docSlice.reducer;
//# sourceMappingURL=docs.js.map