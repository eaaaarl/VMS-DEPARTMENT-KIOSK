import { useNavigation } from "@react-navigation/native";
import { BarcodeScanningResult, Camera } from "expo-camera";
import { useCallback, useEffect, useState } from "react";

interface UseQRScannerReturn {
  hasPermission: boolean | null;
  scanned: boolean;
  cameraEnabled: boolean;
  setCameraEnabled: (enabled: boolean) => void;
  setScanned: (scanned: boolean) => void;
  handleBarCodeScanned: (scanner: BarcodeScanningResult) => void;
  resetScanner: () => void;
}

export const useQRScanner = (
  onScanSuccess: (scannedTicket: string) => Promise<void>
): UseQRScannerReturn => {
  // Camera permission state
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const navigation = useNavigation();

  // Request camera permissions on mount
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();

    // Handle navigation focus/blur events to manage camera state
    const unsubscribeFocus = navigation.addListener("focus", () => {
      setCameraEnabled(true);
    });

    const unsubscribeBlur = navigation.addListener("blur", () => {
      setCameraEnabled(false);
    });

    // Cleanup function to disable camera when component unmounts
    return () => {
      setCameraEnabled(false);
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);

  // Handle barcode scanning
  const handleBarCodeScanned = useCallback(
    async (scanner: BarcodeScanningResult) => {
      if (scanned) return;
      setScanned(true);

      try {
        const scannedTicket = scanner?.data;
        if (scannedTicket) {
          await onScanSuccess(scannedTicket);
        }
      } catch (error) {
        console.log("Error scanning barcode:", error);
        setScanned(false);
      }
    },
    [scanned, onScanSuccess]
  );

  // Reset scanner state
  const resetScanner = useCallback(() => {
    setScanned(false);
  }, []);

  return {
    hasPermission,
    scanned,
    cameraEnabled,
    setCameraEnabled,
    setScanned,
    handleBarCodeScanned,
    resetScanner,
  };
};
