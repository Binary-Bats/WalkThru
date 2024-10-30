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
  },
});

export const { updateSession } = sessionSlice.actions;
export default sessionSlice.reducer;
