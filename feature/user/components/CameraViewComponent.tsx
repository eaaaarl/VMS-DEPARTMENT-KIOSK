import Ionicons from '@expo/vector-icons/Ionicons';
import { BarcodeScanningResult, CameraView } from 'expo-camera';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import QRCodeOverlay from './QRCodeOverlay';

interface CameraViewComponentProps {
  onBarcodeScanned: (scanner: BarcodeScanningResult) => void;
  scanned: boolean;
  cameraEnabled: boolean;
  onScanAgain: () => void;
}

const CameraViewComponent: React.FC<CameraViewComponentProps> = ({
  onBarcodeScanned,
  scanned,
  cameraEnabled,
  onScanAgain
}) => {
  return (
    <View className="flex-1 relative">
      {cameraEnabled ? (
        <>
          <CameraView
            onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            style={{ flex: 1 }}
          />

          {/* QR Code Overlay */}
          <QRCodeOverlay scanned={scanned} />

          {/* Bottom Controls */}
          <View className="absolute bottom-0 left-0 right-0 bg-opacity-50 p-4">
            <View className="flex-row justify-center space-x-4">
              {scanned && (
                <TouchableOpacity
                  onPress={onScanAgain}
                  className="bg-blue-600 px-6 py-3 rounded-lg flex-row items-center"
                >
                  <Ionicons name="scan" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">Scan Again</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600">Camera is disabled</Text>
        </View>
      )}
    </View>
  );
};

export default CameraViewComponent;