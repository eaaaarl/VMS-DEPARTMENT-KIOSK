import { router } from "expo-router";
import { useMemo } from "react";

export interface ErrorConfig {
  icon:
    | "construct-outline"
    | "time-outline"
    | "wifi-outline"
    | "warning-outline"
    | "globe-outline";
  title: string;
  message: string;
  actionText: string;
}

export interface ErrorScreenParams {
  errorType: "server" | "timeout" | "network" | "api" | "connection";
  retryAction?: () => void;
}

export const useErrorScreen = (params?: ErrorScreenParams) => {
  // Get error type from params, default to 'connection'
  const errorType = params?.errorType || "connection";
  const retryAction = params?.retryAction;

  const errorConfig = useMemo<ErrorConfig>(() => {
    switch (errorType) {
      case "server":
        return {
          icon: "construct-outline",
          title: "Server Error",
          message:
            "Our servers are experiencing issues. Please try again in a few moments.",
          actionText: "Retry",
        };
      case "timeout":
        return {
          icon: "time-outline",
          title: "Request Timeout",
          message:
            "The request took too long to complete. Please check your connection and try again.",
          actionText: "Try Again",
        };
      case "network":
        return {
          icon: "wifi-outline",
          title: "Network Error",
          message:
            "Unable to connect to our servers. Please check your internet connection.",
          actionText: "Retry",
        };
      case "api":
        return {
          icon: "warning-outline",
          title: "API Error",
          message:
            "Something went wrong with the service. Our team has been notified.",
          actionText: "Try Again",
        };
      default: // connection
        return {
          icon: "globe-outline",
          title: "Connection Problem",
          message:
            "Unable to connect to the internet. Please check your network settings and try again.",
          actionText: "Retry Connection",
        };
    }
  }, [errorType]);

  const handleRetry = () => {
    if (retryAction && typeof retryAction === "function") {
      retryAction();
    } else {
      // Default behavior: go back or refresh
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/");
      }
    }
  };

  const handleGoHome = () => {
    router.replace("/");
  };

  return {
    errorConfig,
    handleRetry,
    handleGoHome,
  };
};
