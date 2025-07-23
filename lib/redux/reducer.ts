import { departmentApi } from "@/feature/department/api/deparmentApi";
import { labelApi } from "@/feature/label/api/labelApi";
import { visitorApi } from "@/feature/visitor/api/visitorApi";
import { combineReducers } from "@reduxjs/toolkit";
import { configReducer } from "./state/configSlice";
import { departmentCameraEntryReducer } from "./state/departmentCameraEntrySlice";
import { departmentManualEntryReducer } from "./state/departmentManualEntrySlice";
import { modeReducer } from "./state/modeSlice";
import { VisitorDepartmentSignInEntryReducer } from "./state/visitorDepartmentEntry";

const rootReducer = combineReducers({
  // UI State
  config: configReducer,
  mode: modeReducer,
  departmentManualEntry: departmentManualEntryReducer,
  departmentCameraEntry: departmentCameraEntryReducer,
  visitorDepartmentEntry: VisitorDepartmentSignInEntryReducer,

  // RTK Query
  [departmentApi.reducerPath]: departmentApi.reducer,
  [visitorApi.reducerPath]: visitorApi.reducer,
  [labelApi.reducerPath]: labelApi.reducer,
});

export const apis = [departmentApi, visitorApi, labelApi];

export const apisReducerPath = apis.map((api) => api.reducerPath);

export default rootReducer;
