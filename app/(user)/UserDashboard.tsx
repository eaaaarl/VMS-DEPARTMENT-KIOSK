import DepartmentInfo from '@/feature/user/components/DepartmentInfo';
import DepartmentSelector from '@/feature/user/components/DepartmentSelector';
import QuickActions from '@/feature/user/components/QuickActions';
import { useUserDashboard } from '@/feature/user/hooks/useUserDashboard';
import { useAppSelector } from '@/lib/redux/hooks';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserDashboard() {
  const {
    showDepartmentModal,
    selectedDepartment,
    isNavigating,
    isRefreshing,
    isLoadingDepartmentData,
    departmentData,
    setShowDepartmentModal,
    setSelectedDepartment,
    handleCameraScan,
    handleManualEntry,
    handleDepartmentChange,
    handleRefresh,
  } = useUserDashboard();

  const currentMode = useAppSelector(state => state.mode.LayoutMode)

  useEffect(() => {
    if (currentMode === 'Kiosk') {
      router.replace('/(main)/VisitorDashboard')
    }
  }, [currentMode])

  if (isNavigating || isLoadingDepartmentData) {
    return (
      <View className="flex-1 bg-blue-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-6 py-4">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Dashboard
          </Text>
          <Text className="text-gray-600">
            Welcome back! Staff
          </Text>
        </View>

        <DepartmentInfo
          department={selectedDepartment}
          onDepartmentChange={handleDepartmentChange}
        />

        <QuickActions
          onCameraScan={handleCameraScan}
          onManualEntry={handleManualEntry}
        />
      </View>

      <DepartmentSelector
        visible={showDepartmentModal}
        onClose={() => setShowDepartmentModal(false)}
        departments={departmentData?.results || []}
        selectedDepartment={selectedDepartment}
        onSelectDepartment={setSelectedDepartment}
        isLoading={isLoadingDepartmentData}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
}