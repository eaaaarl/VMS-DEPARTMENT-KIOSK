import { combineReducers } from "@reduxjs/toolkit";
import { configReducer } from "./state/configSlice";

const rootReducer = combineReducers({
  config: configReducer,
  
});

export const apis = [];

export const apisReducerPath = apis.map((api) => api.reducerPath);

export default rootReducer;
