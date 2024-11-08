"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// store.ts
const toolkit_1 = require("@reduxjs/toolkit");
const docs_1 = __importDefault(require("./docs"));
const session_1 = __importDefault(require("./session"));
const rootReducer = (0, toolkit_1.combineReducers)({
    docs: docs_1.default,
    session: session_1.default,
});
const store = (0, toolkit_1.configureStore)({
    reducer: rootReducer,
});
exports.default = store;
//# sourceMappingURL=docStore.js.map