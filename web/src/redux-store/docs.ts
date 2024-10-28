import { createSlice } from "@reduxjs/toolkit";
import vscode from "../utils/VscodeSendMessage";
import { v4 as uuidv4 } from "uuid";
declare global {
  interface Window {
    initialData: any;
    vscode: any;
  }
}
// Helper function to load docs from session storage
const loadState = () => {
  const previousState = vscode?.getState();
  return (
    previousState?.docs ||
    window.initialData || { id: uuidv4(), title: "Untitled Docs", blocks: [] }
  );
};

const sendMessage = (docs) => {
  vscode?.postMessage({
    command: "saveDocs",
    data: JSON.parse(JSON.stringify(docs)),
  });
};

// Helper function to save docs to session storage
const saveState = (docs) => {
  vscode?.setState({ docs });
};

// Redux slice
export const docSlice = createSlice({
  name: "docstate",
  initialState: {
    docs: loadState(),
  },
  reducers: {
    addDocs: (state, action) => {
      state.docs = action.payload;
      saveState(state.docs);
      sendMessage(state);
    },
    updateDocs: (state, action) => {
      state.docs.blocks.push(action.payload);
      saveState(state.docs);
      sendMessage(state);
    },
    updateTitle: (state, action) => {
      state.docs.title = action.payload;
      saveState(state.docs);
      sendMessage(state);
    },
    setState: (state, action) => {
      state.docs = action.payload;
    },
  },
});

export const { addDocs, updateDocs, updateTitle, setState } = docSlice.actions;
export default docSlice.reducer;
