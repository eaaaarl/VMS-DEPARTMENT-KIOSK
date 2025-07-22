import { useAppSelector } from '@/lib/redux/hooks';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Custom hooks
import { useQRScanner } from '@/feature/visitor/hooks/useQRScanner';
import { useVisitorManagement } from '@/feature/visitor/hooks/useVisitorManagement';

// Components
import SignOutModal from '@/feature/user/components/SignOutModal';
import VisitorInformationModal from '@/feature/user/components/VisitorInformationModal';
import CameraHeader from '@/feature/visitor/components/CameraHeader';
import CameraViewComponent from '@/feature/visitor/components/CameraViewComponent';
import ConfirmationModal from '@/feature/visitor/components/ConfirmationModal';

export default function CameraScreen() {
  // Redux State
  const { departmentCameraEntry } = useAppSelector((state) => state.departmentCameraEntry);
  const { ipAddress, port } = useAppSelector((state) => state.config);

  // Check configuration
  React.useEffect(() => {
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
  const qrScanner = useQRScanner(visitorManagement.handleScanSuccess);

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
          cameraEnabled={qrScanner.cameraEnabled}
          onToggleCamera={() => qrScanner.setCameraEnabled(!qrScanner.cameraEnabled)}
        />

        {/* Camera View */}
        <CameraViewComponent 
          onBarcodeScanned={qrScanner.handleBarCodeScanned}
          scanned={qrScanner.scanned}
          cameraEnabled={qrScanner.cameraEnabled}
          onScanAgain={qrScanner.resetScanner}
        />
      </View>

      {/* Visitor Information Modal */}
      <VisitorInformationModal
        visible={visitorManagement.showVisitorInformationCheckingModal}
        onClose={visitorManagement.handleCloseVisitorInformationCheckingModal}
        currentVisitorLog={visitorManagement.currentVisitorLog}
        idVisitorImage={visitorManagement.idVisitorImage}
        photoVisitorImage={visitorManagement.photoVisitorImage}
        purpose={visitorManagement.purpose}
        handleChangePurpose={visitorManagement.handleChangePurpose}
        onSubmitVisitorLog={visitorManagement.handleSubmitVisitorLog}
        isLoading={visitorManagement.isLoadingCreateVisitorLogDetail}
      />

      {/* Sign Out Modal */}
      <SignOutModal
        visible={visitorManagement.showSignOutModal}
        onClose={() => visitorManagement.setShowSignOutModal(false)}
        onConfirm={visitorManagement.handleSignOut}
        ticketId={visitorManagement.currentVisitorLogInDetailSignOut?.strId || ''}
        isLoading={visitorManagement.isLoadingUpdateVisitorsLogDetail}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={visitorManagement.showModal}
        onClose={visitorManagement.handleCancelDifferentOffice}
        onConfirm={visitorManagement.handleYesDifferentOffice}
        message={visitorManagement.modalMessage}
      />
    </SafeAreaView>
  );
}