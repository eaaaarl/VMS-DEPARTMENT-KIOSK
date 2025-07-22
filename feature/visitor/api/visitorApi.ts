import { RootState } from "@/lib/redux/store";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { formattedDate } from "../utils/formattedDate";
import {
  ICreateVisitorLogDetailPayload,
  ICreateVisitorLogDuplicatePhoto,
  ICreateVisitorLogPayload,
  IVisitorImageResponse,
  IVisitorLogDetailResponse,
  IVisitorLogInfoResponse,
  IVisitorSignOutPayload,
  VisitorApiResponse,
} from "./inteface";

export const visitorApi = createApi({
  reducerPath: "visitorApi",
  baseQuery: async (args, api, extraOptions) => {
    const state = api.getState() as RootState;

    // console.log("State keys:", Object.keys(state));
    // console.log("Config exists:", !!state.config);

    const ipAddress = state.config?.ipAddress;
    const port = state.config?.port;
    const baseUrl = `http://${ipAddress}:${port}`;

    // console.log("Using IP:", ipAddress);
    // console.log("Using Port:", port);
    // console.log("Constructed baseUrl:", baseUrl);

    let url: string;
    let adjustedArgs: any;

    if (typeof args === "string") {
      url = `${baseUrl}${args}`;
      adjustedArgs = url;
    } else {
      url = `${baseUrl}${args.url}`;
      adjustedArgs = { ...args, url };
    }

    const baseQuery = fetchBaseQuery({
      baseUrl,
    });
    return baseQuery(adjustedArgs, api, extraOptions);
  },
  tagTypes: [
    "VisitorLogInfo",
    "VisitorLogInDetailInfo",
    "VisitorImage",
    "VisitorLogDetail",
  ],
  endpoints: (builder) => ({
    visitorLogInfo: builder.query<IVisitorLogInfoResponse, { strId: string }>({
      query: ({ strId }) => ({
        url: `/visitors-log/public?DATE(logIn)='${formattedDate(new Date())}'&strId='${strId}'&limit=1&order=login DESC`,
        method: "GET",
      }),
      providesTags: ["VisitorLogInfo"],
    }),

    visitorLogInDetailInfo: builder.query<
      IVisitorLogDetailResponse,
      { strId: string }
    >({
      query: ({ strId }) => {
        return {
          url: `/visitors-log-detail/public?DATE(visit_log_detail.logIn)='${formattedDate(new Date())}'&visit_log_detail.strId='${strId}'&limit=1&order=login DESC`,
          method: "GET",
        };
      },
      providesTags: ["VisitorLogInDetailInfo"],
    }),

    visitorImage: builder.query<IVisitorImageResponse, { fileName: string }>({
      query: ({ fileName }) => {
        return {
          url: `/visitors-log/public/visit-log/visitors/photo/${fileName}`,
          method: "GET",
        };
      },
      providesTags: ["VisitorImage"],
    }),

    createVisitorLogDetail: builder.mutation<
      {
        ghError: number;
        ghMessage: string;
      },
      ICreateVisitorLogDetailPayload
    >({
      query: ({ payload }) => {
        return {
          url: `/visitors-log-detail/public`,
          method: "POST",
          body: payload,
        };
      },
      invalidatesTags: [
        "VisitorLogInfo",
        "VisitorLogInDetailInfo",
        "VisitorImage",
      ],
    }),

    createVisitorLog: builder.mutation<
      { ghError: number; ghMessage: string },
      ICreateVisitorLogPayload
    >({
      query: (payload) => ({
        url: `/visitors-log/public/visit-log`,
        method: "POST",
        body: {
          log: payload,
        },
      }),
      invalidatesTags: ["VisitorLogInfo"],
    }),

    updateVisitorLog: builder.mutation({
      query: ({ id, dateTime, logOut, sysLogOut, returned }) => ({
        url: `/visitors-log/public/visit-log/${id}/${dateTime}`,
        method: "PUT",
        body: {
          logOut,
          sysLogOut: sysLogOut,
          returned: returned,
          userLogOutId: null,
        },
      }),
      invalidatesTags: ["VisitorLogInfo", "VisitorLogInDetailInfo"],
    }),

    updateVisitorsLogDetail: builder.mutation<
      { ghError: number; ghMessage: string },
      {
        id: string;
        dateTime: string;
        deptLogOut?: string;
        userDeptLogOutId?: number | null;
        sysDeptLogOut?: boolean;
      }
    >({
      query: ({
        id,
        dateTime,
        deptLogOut,
        userDeptLogOutId,
        sysDeptLogOut,
      }) => {
        return {
          url: `/visitors-log-detail/public/visit-log-detail/${id}/${dateTime}`,
          method: "PUT",
          body: {
            deptLogOut,
            userDeptLogOutId,
            sysDeptLogOut,
          },
        };
      },
      invalidatesTags: ["VisitorLogInfo", "VisitorLogInDetailInfo"],
    }),

    createVisitorLogDuplicatePhoto: builder.mutation<
      { ghError: number; ghMessage: string },
      ICreateVisitorLogDuplicatePhoto
    >({
      query: (payload) => ({
        url: `/visitors-log/public/photo-duplicate`,
        method: "POST",
        body: payload,
      }),
    }),

    signOutVisitorLogDetail: builder.mutation<
      VisitorApiResponse,
      { strId: string; dateTime: string; payload: IVisitorSignOutPayload }
    >({
      query: ({ dateTime, payload, strId }) => ({
        url: `/visitors-log-detail/public/visit-log-detail/${strId}/${dateTime}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["VisitorLogDetail"],
    }),
  }),
});

export const {
  useVisitorLogInfoQuery,
  useLazyVisitorLogInfoQuery,
  useVisitorLogInDetailInfoQuery,
  useLazyVisitorLogInDetailInfoQuery,
  useVisitorImageQuery,
  useLazyVisitorImageQuery,
  useCreateVisitorLogDetailMutation,
  useUpdateVisitorsLogDetailMutation,
  useUpdateVisitorLogMutation,
  useCreateVisitorLogMutation,
  useCreateVisitorLogDuplicatePhotoMutation,
  useSignOutVisitorLogDetailMutation,
} = visitorApi;
