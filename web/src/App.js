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
const LoadingScreen = () => {
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
      <div className="honeycomb ">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p className="text-white mt-7 text-xl font-medium">Syncing Docs...</p>
    </div>);
};
function App() {
    const dispatch = (0, react_redux_1.useDispatch)();
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000);
    }, []);
    (0, react_1.useEffect)(() => {
        const handleMessage = async (event) => {
            console.log("Received message:", event.data);
            if (event.data.command === "initialData") {
                setIsLoading(true);
                const docs = event.data.data;
                window.initialData = docs;
                dispatch((0, docs_1.setState)(docs));
                // Ensure loader shows for at least 500ms
                await new Promise(resolve => setTimeout(resolve, 1000));
                setIsLoading(false);
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [dispatch]);
    return (<>
      {isLoading && <LoadingScreen />}
      <Home_1.default />
    </>);
}
//# sourceMappingURL=App.js.map