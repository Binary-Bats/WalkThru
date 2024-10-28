import { useEffect } from "react";
import "./App.css";

import Home from "./components/Home";
import { useDispatch, useSelector } from 'react-redux';
import { setState } from './redux-store/docs';

declare global {
  interface Window {
    initialData: any;
    vscode: any;
  }
}


export default function App() {
  // const dispatch = useDispatch()
  // useEffect(() => {
  //   if (window.initialData) {
  //     dispatch(setState(window.initialData))
  //   }

  // }, []);



  return (

    <>
      <Home />
      {/* <Highlighter filePath="cot/test.js" content={markdown} startNumber={20} /> */}
    </>

  );
}
