import { createSlice } from "@reduxjs/toolkit";
import vscode from "../utils/VscodeSendMessage";
import { v4 as uuidv4 } from "uuid";
import { useDispatch } from "react-redux";
import React from "react";

// Types
type Block = {
  id: string;
  type: "snippet" | "path";
  [key: string]: any;
};

type DocsState = {
  id: string;
  title: string;
  blocks: Block[];
};

type RootState = {
  docs: DocsState;
};

// Helper functions
const loadState = (): DocsState => {
  const previousState = vscode?.getState();
  return (
    previousState?.docs ||
    window.initialData || {
      id: uuidv4(),
      title: "Untitled Docs",
      blocks: [],
    }
  );
};

const sendMessage = (state: RootState) => {
  vscode?.postMessage({
    command: "saveDocs",
    data: JSON.parse(JSON.stringify(state)),
  });
};

const saveState = (docs: DocsState) => {
  vscode?.setState({ docs });
};

// Redux slice
export const docSlice = createSlice({
  name: "docstate",
  initialState: {
    docs: loadState(),
  } as RootState,
  reducers: {
    addDocs: (state, action) => {
      // Create new state object
      const newDocs = {
        ...action.payload,
        id: state.docs.id,
      };

      // Return new state
      const newState = {
        ...state,
        docs: newDocs,
      };

      saveState(newDocs);
      sendMessage(newState);
      return newState;
    },

    updateDocs: (state, action) => {
      // Create new blocks array with new block
      const newBlocks = [...state.docs.blocks, action.payload];

      // Create new state with updated blocks
      const newState = {
        ...state,
        docs: {
          ...state.docs,
          blocks: newBlocks,
        },
      };

      saveState(newState.docs);
      sendMessage(newState);
      return newState;
    },

    updateDocBlocks: (state, action) => {
      // Create new state with new blocks array
      const newState = {
        ...state,
        docs: {
          ...state.docs,
          blocks: action.payload,
        },
      };

      saveState(newState.docs);
      sendMessage(newState);
      return newState;
    },

    deleteBlocksById: (state, action) => {
      // Filter blocks immutably
      const newBlocks = state.docs.blocks.filter(
        (block: Block) => block.id !== action.payload
      );

      // Create new state with filtered blocks
      const newState = {
        ...state,
        docs: {
          ...state.docs,
          blocks: newBlocks,
        },
      };

      saveState(newState.docs);
      sendMessage(newState);
      return newState;
    },

    updateTitle: (state, action) => {
      // Create new state with updated title
      const newState = {
        ...state,
        docs: {
          ...state.docs,
          title: action.payload,
        },
      };

      saveState(newState.docs);
      sendMessage(newState);
      return newState;
    },

    setState: (state, action) => {
      // Create entirely new state
      const newState = {
        ...state,
        docs: action.payload,
      };

      saveState(newState.docs);
      return newState;
    },
  },
});

// Message handler
// export const useInitialize = () => {
//   const dispatch = useDispatch();

//   React.useEffect(() => {
//     const handleMessage = (event: MessageEvent) => {
//       console.log("Received message:", event.data);
//       if (event.data.command === "initialData") {
//         const docs = event.data.data;
//         window.initialData = docs;
//         dispatch(setState(docs));
//       }
//     };

//     window.addEventListener("message", handleMessage);
//     return () => window.removeEventListener("message", handleMessage);
//   }, [dispatch]);
// };

export const {
  addDocs,
  updateDocs,
  updateTitle,
  updateDocBlocks,
  setState,
  deleteBlocksById,
} = docSlice.actions;

export default docSlice.reducer;
