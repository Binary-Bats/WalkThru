"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlocksById = exports.setState = exports.updateDocBlocks = exports.updateTitle = exports.updateDocs = exports.addDocs = exports.docSlice = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const VscodeSendMessage_1 = __importDefault(require("../utils/VscodeSendMessage"));
const uuid_1 = require("uuid");
// Helper functions
const loadState = () => {
    const previousState = VscodeSendMessage_1.default?.getState();
    return (previousState?.docs ||
        window.initialData || {
        id: (0, uuid_1.v4)(),
        title: "Untitled Docs",
        blocks: [],
    });
};
const sendMessage = (state) => {
    VscodeSendMessage_1.default?.postMessage({
        command: "saveDocs",
        data: JSON.parse(JSON.stringify(state)),
    });
};
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
            // Create new state object
            const newDocs = {
                ...action.payload,
                id: state.docs.id,
            };
            // Return new state
            const newState = {
                ...state,
                docs: newDocs,
            };
            saveState(newDocs);
            sendMessage(newState);
            return newState;
        },
        updateDocs: (state, action) => {
            // Create new blocks array with new block
            const newBlocks = [...state.docs.blocks, action.payload];
            // Create new state with updated blocks
            const newState = {
                ...state,
                docs: {
                    ...state.docs,
                    blocks: newBlocks,
                },
            };
            saveState(newState.docs);
            sendMessage(newState);
            return newState;
        },
        updateDocBlocks: (state, action) => {
            // Create new state with new blocks array
            const newState = {
                ...state,
                docs: {
                    ...state.docs,
                    blocks: action.payload,
                },
            };
            saveState(newState.docs);
            sendMessage(newState);
            return newState;
        },
        deleteBlocksById: (state, action) => {
            // Filter blocks immutably
            const newBlocks = state.docs.blocks.filter((block) => block.id !== action.payload);
            // Create new state with filtered blocks
            const newState = {
                ...state,
                docs: {
                    ...state.docs,
                    blocks: newBlocks,
                },
            };
            saveState(newState.docs);
            sendMessage(newState);
            return newState;
        },
        updateTitle: (state, action) => {
            // Create new state with updated title
            const newState = {
                ...state,
                docs: {
                    ...state.docs,
                    title: action.payload,
                },
            };
            saveState(newState.docs);
            sendMessage(newState);
            return newState;
        },
        setState: (state, action) => {
            // Create entirely new state
            const newState = {
                ...state,
                docs: action.payload,
            };
            saveState(newState.docs);
            return newState;
        },
    },
});
// Message handler
// export const useInitialize = () => {
//   const dispatch = useDispatch();
//   React.useEffect(() => {
//     const handleMessage = (event: MessageEvent) => {
//       console.log("Received message:", event.data);
//       if (event.data.command === "initialData") {
//         const docs = event.data.data;
//         window.initialData = docs;
//         dispatch(setState(docs));
//       }
//     };
//     window.addEventListener("message", handleMessage);
//     return () => window.removeEventListener("message", handleMessage);
//   }, [dispatch]);
// };
_a = exports.docSlice.actions, exports.addDocs = _a.addDocs, exports.updateDocs = _a.updateDocs, exports.updateTitle = _a.updateTitle, exports.updateDocBlocks = _a.updateDocBlocks, exports.setState = _a.setState, exports.deleteBlocksById = _a.deleteBlocksById;
exports.default = exports.docSlice.reducer;
//# sourceMappingURL=docs.js.map