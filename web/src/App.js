"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const react_1 = require("react");
require("./App.css");
const Home_1 = __importDefault(require("./components/Home"));
const react_redux_1 = require("react-redux");
const docs_1 = require("./redux-store/docs");
function App() {
    const dispatch = (0, react_redux_1.useDispatch)();
    (0, react_1.useEffect)(() => {
        window.addEventListener("message", (event) => {
            console.log("Received message:", event.data);
            if (event.data.command === "initialData") {
                const docs = event.data.data;
                window.initialData = docs;
                dispatch((0, docs_1.setState)(docs));
            }
        });
    });
    return (<>
      <Home_1.default />
      {/* <Highlighter filePath="cot/test.js" content={markdown} startNumber={20} /> */}
    </>);
}
//# sourceMappingURL=App.js.map