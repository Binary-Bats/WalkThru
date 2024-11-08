import { useEffect, useState } from "react";
import "./App.css";
import Home from "./components/Home";
import { useDispatch } from 'react-redux';
import { setState } from './redux-store/docs';

declare global {
  interface Window {
    initialData: any;
    image: any;
    vscode: any;
  }
}

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
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
    </div>
  );
};

export default function App() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }, [])
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      console.log("Received message:", event.data);
      if (event.data.command === "initialData") {
        setIsLoading(true);
        const docs = event.data.data;
        window.initialData = docs;
        dispatch(setState(docs));

        // Ensure loader shows for at least 500ms
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [dispatch]);

  return (
    <>
      {isLoading && <LoadingScreen />}
      <Home />
    </>
  );
}