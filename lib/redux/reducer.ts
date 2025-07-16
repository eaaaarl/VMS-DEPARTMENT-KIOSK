import { departmentApi } from "@/feature/department/api/deparmentApi";
import { combineReducers } from "@reduxjs/toolkit";
import { configReducer } from "./state/configSlice";

const rootReducer = combineReducers({
  // UI State
  config: configReducer,

  // RTK Query
  [departmentApi.reducerPath]: departmentApi.reducer,
});

export const apis = [departmentApi];

export const apisReducerPath = apis.map((api) => api.reducerPath);

export default rootReducer;
