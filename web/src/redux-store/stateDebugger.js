"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateDebugger = void 0;
// StateDebugger.tsx - Add this component to debug state
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
const StateDebugger = () => {
    const fullState = (0, react_redux_1.useSelector)((state) => state);
    react_1.default.useEffect(() => {
        console.log('Full Redux State:', fullState);
        console.log('Docs State:', fullState.docs);
        console.log('Session State:', fullState.session);
    }, [fullState]);
    return null;
};
exports.StateDebugger = StateDebugger;
//# sourceMappingURL=stateDebugger.js.map