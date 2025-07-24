import { DepartmentDisplay } from '@/feature/main/components/DepartmentDisplay';
import { DepartmentModal } from '@/feature/main/components/DepartmentModal';
import { QRScanButton } from '@/feature/main/components/QRScanButton';
import { WelcomeHeader } from '@/feature/main/components/WelcomeHeader';
import { useVisitorDashboard } from '@/feature/main/hooks/useVisitorDashboard';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VisitorDashboard() {
  const {
    isNavigating,
    isLoadingDepartment,
    showDepartmentModal,
    setShowDepartmentModal,
    currentDepartment,
    isRefreshing,
    departmentData,
    handleDepartmentChange,
    handleDepartmentSelect,
    handleRefresh,
    handleQRScan,
  } = useVisitorDashboard();

  if (isNavigating || isLoadingDepartment) {
    return (
      <View className="flex-1 bg-blue-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <WelcomeHeader />

      <DepartmentDisplay
        currentDepartment={currentDepartment}
        onDepartmentChange={handleDepartmentChange}
      />

      <QRScanButton onPress={handleQRScan} />

      <View className="pb-6 px-6">
        <Text className="text-gray-600 text-center text-sm font-['Poppins']">
          Department Access Portal
        </Text>
      </View>

      <DepartmentModal
        visible={showDepartmentModal}
        onClose={() => setShowDepartmentModal(false)}
        departments={departmentData?.results || []}
        currentDepartment={currentDepartment}
        onDepartmentSelect={handleDepartmentSelect}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
}