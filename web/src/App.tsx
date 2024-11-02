import { useEffect } from "react";
import "./App.css";

import Home from "./components/Home";
import { useDispatch, useSelector } from 'react-redux';
import { setState } from './redux-store/docs';

import { use } from "marked";


declare global {
  interface Window {
    initialData: any;
    vscode: any;
  }
}


export default function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    window.addEventListener("message", (event) => {
      console.log("Received message:", event.data);
      if (event.data.command === "initialData") {
        const docs = event.data.data;
        window.initialData = docs;
        dispatch(setState(docs));
      }
    })
  })



  return (

    <>
      <Home />
      {/* <Highlighter filePath="cot/test.js" content={markdown} startNumber={20} /> */}
    </>

  );
}
