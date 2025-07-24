import ConfirmationModal from '@/feature/user/components/ConfirmationModal';
import QRCodeOverlay from '@/feature/user/components/QRCodeOverlay';
import SignOutModal from '@/feature/user/components/SignOutModal';
import VisitorInformationModal from '@/feature/user/components/VisitorInformationModal';
import { useVisitorCamera } from '@/feature/visitor/hooks/useVisitorCamera';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VisitorCameraScreen() {
  const {
    
    // Camera states
    hasPermission,
    scanned,
    cameraEnabled,
    setCameraEnabled,

    // Modal states and data
    showVisitorInformationCheckingModal,
    showSignOutModal,
    showModal,
    modalMessage,
    currentVisitorLog,
    currentVisitorLogInDetailSignOut,
    purpose,
    idVisitorImage,
    photoVisitorImage,

    // Loading state
    isLoading,

    // Handlers
    handleQrCodeScanned,
    handleChangePurpose,
    handleCloseVisitorInformationCheckingModal,
    handleSubmitVisitorLog,
    handleSignOut,
    handleYesDifferentOffice,
    handleCancelDifferentOffice,
    resetScanner,
  } = useVisitorCamera();

  if (hasPermission === null) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="camera-outline" size={64} color="#EF4444" />
          <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">
            Camera Access Required
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            This app needs camera access to scan QR codes. Please enable camera permissions in your device settings.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="p-4 flex-row justify-between items-center bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">Visitor Sign In/Out</Text>
          <TouchableOpacity
            onPress={() => setCameraEnabled(!cameraEnabled)}
            className="p-2"
          >
            <Ionicons
              name={cameraEnabled ? "camera" : "camera-outline"}
              size={24}
              color={cameraEnabled ? "#3B82F6" : "#6B7280"}
            />
          </TouchableOpacity>
        </View>

        {/* Camera View */}
        <View className="flex-1 relative">
          {cameraEnabled ? (
            <>
              {/* Only mount CameraView when cameraEnabled is true */}
              <CameraView
                onBarcodeScanned={scanned ? undefined : handleQrCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
                style={{ flex: 1 }}
                facing="front" // Set camera to front-facing
              />

              <QRCodeOverlay scanned={scanned} />

              {/* Bottom Controls */}
              <View className="absolute bottom-0 left-0 right-0 bg-opacity-50 p-4">
                <View className="flex-row justify-center space-x-4">
                  {scanned && (
                    <TouchableOpacity
                      onPress={resetScanner}
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
              <AntDesign name="camera" size={24} color="black" />
              <Text className="text-gray-600 mt-4 mb-2 text-lg">Camera is disabled</Text>
              <Text className="text-gray-500 text-center mb-6 px-8">
                {scanned ? "QR code has been scanned successfully." : "Camera is currently turned off."}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setCameraEnabled(true);
                  resetScanner();
                }}
                className="mt-4 bg-blue-600 px-6 py-3 rounded-lg flex-row items-center"
              >
                <Ionicons name="scan" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  {scanned ? "Scan Another Code" : "Enable Camera"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <VisitorInformationModal
        visible={showVisitorInformationCheckingModal}
        onClose={() => {
          handleCloseVisitorInformationCheckingModal();
          // Re-enable camera when modal is closed without submission
          setTimeout(() => {
            resetScanner();
            setCameraEnabled(true);
          }, 500);
        }}
        currentVisitorLog={currentVisitorLog}
        idVisitorImage={idVisitorImage}
        photoVisitorImage={photoVisitorImage}
        purpose={purpose}
        handleChangePurpose={handleChangePurpose}
        onSubmitVisitorLog={handleSubmitVisitorLog}
        isLoading={isLoading}
      />

      <SignOutModal
        visible={showSignOutModal}
        onClose={() => {
          handleCloseVisitorInformationCheckingModal();
          setTimeout(() => {
            resetScanner();
            setCameraEnabled(true);
          }, 500);
        }}
        onConfirm={handleSignOut}
        ticketId={currentVisitorLogInDetailSignOut?.strId || ''}
        isLoading={isLoading}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showModal}
        onClose={() => {
          handleCancelDifferentOffice();
          // Re-enable camera when modal is closed without confirmation
          setTimeout(() => {
            resetScanner();
            setCameraEnabled(true);
          }, 500);
        }}
        onConfirm={() => {
          handleYesDifferentOffice();
          // Camera will be re-enabled in handleYesDifferentOffice after success
        }}
        message={modalMessage}
      />
    </SafeAreaView>
  );
}