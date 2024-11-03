"use strict";
// types.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeBlocksById = exports.updateSession = exports.sessionSlice = void 0;
// sessionSlice.ts
const toolkit_1 = require("@reduxjs/toolkit");
const VscodeSendMessage_1 = __importDefault(require("../utils/VscodeSendMessage"));
const initialState = {
    session: {
        blocks: [],
    },
};
exports.sessionSlice = (0, toolkit_1.createSlice)({
    name: "session",
    initialState,
    reducers: {
        updateSession: (state, action) => {
            state.session.blocks = action.payload;
            VscodeSendMessage_1.default?.setState({ session: action.payload });
        },
        removeBlocksById: (state, action) => {
            state.session.blocks = state.session.blocks.filter((block) => block.id !== action.payload);
            VscodeSendMessage_1.default?.setState({ session: state.session.blocks });
        },
    },
});
_a = exports.sessionSlice.actions, exports.updateSession = _a.updateSession, exports.removeBlocksById = _a.removeBlocksById;
exports.default = exports.sessionSlice.reducer;
//# sourceMappingURL=session.js.map