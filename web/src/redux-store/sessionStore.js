"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const toolkit_1 = require("@reduxjs/toolkit");
const session_1 = __importDefault(require("./session"));
exports.default = (0, toolkit_1.configureStore)({
    reducer: session_1.default,
});
//# sourceMappingURL=sessionStore.js.map