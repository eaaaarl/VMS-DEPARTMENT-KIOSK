import { useAppSelector } from '@/lib/redux/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Custom hooks
import { useQRScanner } from '@/feature/user/hooks/useQRScanner';
import { useVisitorManagement } from '@/feature/user/hooks/useVisitorManagement';

// Components
import CameraHeader from '@/feature/user/components/CameraHeader';
import CameraViewComponent from '@/feature/user/components/CameraViewComponent';
import ConfirmationModal from '@/feature/user/components/ConfirmationModal';
import SignOutModal from '@/feature/user/components/SignOutModal';
import VisitorInformationModal from '@/feature/user/components/VisitorInformationModal';

export default function CameraScreen() {
  // State to track if QR processing is in progress
  const [isProcessingQR, setIsProcessingQR] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  // Navigation state
  const isFocused = useIsFocused();

  // Redux State
  const { departmentCameraEntry } = useAppSelector((state) => state.departmentCameraEntry);
  const { ipAddress, port } = useAppSelector((state) => state.config);

  // Check configuration
  useEffect(() => {
    const checkingConfig = async () => {
      if (!ipAddress || ipAddress === '' || !port || port === 0) {
        router.replace('/(developer)/DeveloperSetting');
        return;
      }
    };
    checkingConfig();
  }, [ipAddress, port]);

  // Custom hooks
  const visitorManagement = useVisitorManagement(departmentCameraEntry);

  // Custom success handler that sets processing state
  const handleScanSuccess = async (scannedTicket: string) => {
    setIsProcessingQR(true);
    await visitorManagement.handleScanSuccess(scannedTicket);
  };

  const qrScanner = useQRScanner(handleScanSuccess);

  // Handle component mount/unmount
  useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, []);

  // Reset scanner when visitor information modal is closed
  useEffect(() => {
    if (!visitorManagement.showVisitorInformationCheckingModal &&
      !visitorManagement.showSignOutModal &&
      !visitorManagement.showModal &&
      qrScanner.scanned) {
      qrScanner.resetScanner();
      setIsProcessingQR(false);
    }
  }, [
    visitorManagement.showVisitorInformationCheckingModal,
    visitorManagement.showSignOutModal,
    visitorManagement.showModal,
    qrScanner
  ]);

  // Disable camera when navigating away using Expo Router's focus state
  useEffect(() => {
    if (isFocused && isMounted && !isProcessingQR) {
      qrScanner.setCameraEnabled(true);
    } else {
      qrScanner.setCameraEnabled(false);
    }

    return () => {
      qrScanner.setCameraEnabled(false);
    };
  }, [isFocused, isProcessingQR, isMounted, qrScanner]);

  if (qrScanner.hasPermission === null) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (qrScanner.hasPermission === false) {
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
        <CameraHeader
          onBack={() => router.back()}
          cameraEnabled={qrScanner.cameraEnabled && !isProcessingQR}
          onToggleCamera={() => {
            if (!isProcessingQR) {
              qrScanner.setCameraEnabled(!qrScanner.cameraEnabled);
            }
          }}
        />

        {/* Camera View or Processing State */}
        {isProcessingQR ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-4 text-gray-600">Processing QR code...</Text>
          </View>
        ) : (
          <CameraViewComponent
            onBarcodeScanned={qrScanner.handleBarCodeScanned}
            scanned={qrScanner.scanned}
            cameraEnabled={qrScanner.cameraEnabled && isMounted}
            onScanAgain={qrScanner.resetScanner}
          />
        )}
      </View>

      {/* Visitor Information Modal */}
      <VisitorInformationModal
        visible={visitorManagement.showVisitorInformationCheckingModal}
        onClose={() => {
          visitorManagement.handleCloseVisitorInformationCheckingModal();
          qrScanner.resetScanner(); // Reset scanner when modal is closed
          setIsProcessingQR(false);
        }}
        currentVisitorLog={visitorManagement.currentVisitorLog}
        idVisitorImage={visitorManagement.idVisitorImage}
        photoVisitorImage={visitorManagement.photoVisitorImage}
        purpose={visitorManagement.purpose}
        handleChangePurpose={visitorManagement.handleChangePurpose}
        onSubmitVisitorLog={visitorManagement.handleSubmitVisitorLog}
        isLoading={
          visitorManagement.isLoadingCreateVisitorLogDetail ||
          visitorManagement.isLoadingUpdateVisitorLog ||
          visitorManagement.isLoadingUpdateVisitorsLogDetail ||
          visitorManagement.isLoadingCreateVisitorLog ||
          visitorManagement.isLoadingCreateDuplicatePhotoVisitor
        }
      />

      {/* Sign Out Modal */}
      <SignOutModal
        visible={visitorManagement.showSignOutModal}
        onClose={() => {
          visitorManagement.setShowSignOutModal(false);
          qrScanner.resetScanner(); // Reset scanner when modal is closed
        }}
        onConfirm={() => {
          visitorManagement.handleSignOut();
          // Scanner will be reset when modal closes via the useEffect
        }}
        ticketId={visitorManagement.currentVisitorLogInDetailSignOut?.strId || ''}
        isLoading={
          visitorManagement.isLoadingUpdateVisitorsLogDetail ||
          visitorManagement.isLoadingSignOutVisitor
        }
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={visitorManagement.showModal}
        onClose={() => {
          visitorManagement.handleCancelDifferentOffice();
          qrScanner.resetScanner(); // Reset scanner when modal is closed
        }}
        onConfirm={() => {
          visitorManagement.handleYesDifferentOffice();
          // Scanner will be reset when modal closes via the useEffect
        }}
        message={visitorManagement.modalMessage}
      />

    </SafeAreaView>
  );
}