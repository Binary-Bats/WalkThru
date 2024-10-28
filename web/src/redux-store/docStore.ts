import { configureStore } from "@reduxjs/toolkit";
import docsReducer from "./docs";

export default configureStore({
  reducer: docsReducer,
});
