"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
require("./App.css");
const Home_1 = __importDefault(require("./components/Home"));
function App() {
    // const dispatch = useDispatch()
    // useEffect(() => {
    //   if (window.initialData) {
    //     dispatch(setState(window.initialData))
    //   }
    // }, []);
    return (<>
      <Home_1.default />
      {/* <Highlighter filePath="cot/test.js" content={markdown} startNumber={20} /> */}
    </>);
}
//# sourceMappingURL=App.js.map