// types.ts

interface SessionState {
  session: {
    blocks: [];
  };
}

// sessionSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import vscode from "../utils/VscodeSendMessage";

const initialState = {
  session: {
    blocks: [],
  },
};

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    updateSession: (state, action) => {
      state.session.blocks = action.payload;
      vscode?.setState({ session: action.payload });
    },
    removeBlocksById: (state, action: PayloadAction<string>) => {
      state.session.blocks = state.session.blocks.filter(
        (block) => block.id !== action.payload
      );
      vscode?.setState({ session: state.session.blocks });
    },
  },
});

export const { updateSession, removeBlocksById } = sessionSlice.actions;
export default sessionSlice.reducer;
