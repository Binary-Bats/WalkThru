// store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import docsReducer from "./docs";
import sessionReducer from "./session";

const rootReducer = combineReducers({
  docs: docsReducer,
  session: sessionReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export type AppState = ReturnType<typeof store.getState>;
export default store;
