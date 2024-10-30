"use strict";
// types.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSession = exports.sessionSlice = void 0;
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
    },
});
exports.updateSession = exports.sessionSlice.actions.updateSession;
exports.default = exports.sessionSlice.reducer;
//# sourceMappingURL=session.js.map