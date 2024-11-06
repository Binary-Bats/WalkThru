"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const Token_1 = __importDefault(require("./Token"));
const TokenModel = ({ handleClose }) => {
    return (<div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">

            <Token_1.default handleClose={handleClose}/>
        </div>);
};
exports.default = TokenModel;
//# sourceMappingURL=TokenModel.js.map