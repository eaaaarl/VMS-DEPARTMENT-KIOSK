import { RootState } from "@/lib/redux/store";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ILabelMessageApiResponse } from "./interface";

export const labelApi = createApi({
  reducerPath: "labelApi",
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

  endpoints: (builder) => ({
    getLabelMessage: builder.query<ILabelMessageApiResponse[], void>({
      query: () => ({
        url: `/label-message/public/label-message`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetLabelMessageQuery } = labelApi;
