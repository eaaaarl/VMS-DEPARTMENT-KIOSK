import { departmentApi } from "@/feature/department/api/deparmentApi";
import { visitorApi } from "@/feature/visitor/api/visitorApi";
import { combineReducers } from "@reduxjs/toolkit";
import { configReducer } from "./state/configSlice";
import { departmentCameraEntryReducer } from "./state/departmentCameraEntrySlice";
import { departmentManualEntryReducer } from "./state/departmentManualEntrySlice";
import { departmentReducer } from "./state/departmentSlice";
import { modeReducer } from "./state/modeSlice";

const rootReducer = combineReducers({
  // UI State
  config: configReducer,
  mode: modeReducer,
  department: departmentReducer,
  departmentManualEntry: departmentManualEntryReducer,
  departmentCameraEntry: departmentCameraEntryReducer,

  // RTK Query
  [departmentApi.reducerPath]: departmentApi.reducer,
  [visitorApi.reducerPath]: visitorApi.reducer,
});

export const apis = [departmentApi, visitorApi];

export const apisReducerPath = apis.map((api) => api.reducerPath);

export default rootReducer;
