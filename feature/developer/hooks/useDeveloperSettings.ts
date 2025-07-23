import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { resetConfig, setConfig } from "@/lib/redux/state/configSlice";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";

interface ValidationErrors {
  ipAddress?: string;
  port?: string;
}

export interface DeveloperSettingsHook {
  ipAddress: string;
  port: string;
  errors: ValidationErrors;
  loading: boolean;
  setIpAddress: (value: string) => void;
  setPort: (value: string) => void;
  handleSave: () => void;
  handleReset: () => void;
}

export const useDeveloperSettings = (): DeveloperSettingsHook => {
  const dispatch = useAppDispatch();
  const currentConfig = useAppSelector((state) => state.config);

  const [ipAddress, setIpAddress] = useState("");
  const [port, setPort] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentConfig.ipAddress) {
      setIpAddress(currentConfig.ipAddress);
    }
    if (currentConfig.port) {
      setPort(currentConfig.port.toString());
    }
  }, [currentConfig.ipAddress, currentConfig.port]);

  const validateIP = (ip: string): boolean => {
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip) || ip === "localhost";
  };

  const validatePort = (port: string): boolean => {
    const portNum = parseInt(port);
    return portNum >= 1 && portNum <= 65535;
  };

  const handleSave = () => {
    const newErrors: ValidationErrors = {};

    if (!ipAddress.trim()) {
      newErrors.ipAddress = "IP address is required";
    } else if (!validateIP(ipAddress.trim())) {
      newErrors.ipAddress = "Please enter a valid IP address";
    }

    if (!port.trim()) {
      newErrors.port = "Port is required";
    } else if (!validatePort(port.trim())) {
      newErrors.port = "Port must be between 1 and 65535";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }
    setLoading(true);
    try {
      dispatch(
        setConfig({ ipAddress: ipAddress.trim(), port: parseInt(port) })
      );
      Toast.show({
        type: "success",
        text1: "Settings saved",
        text2: "Your settings have been saved successfully",
      });
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset to default values?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setIpAddress("");
            setPort("");
            setErrors({});
            dispatch(resetConfig());
            Toast.show({
              type: "success",
              text1: "Settings reset",
              text2: "Your settings have been reset successfully",
            });
          },
        },
      ]
    );
  };

  return {
    ipAddress,
    port,
    errors,
    loading,
    setIpAddress,
    setPort,
    handleSave,
    handleReset,
  };
};
