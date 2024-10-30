import { configureStore } from "@reduxjs/toolkit";
import docsReducer from "./docs";
import sessionReducer from "./session";

export default configureStore({
  reducer: sessionReducer,
});
