import TapDetectorForMode from '@/components/TapDetectorForMode';
import { DepartmentDisplay } from '@/feature/main/components/DepartmentDisplay';
import { DepartmentModal } from '@/feature/main/components/DepartmentModal';
import { QRScanButton } from '@/feature/main/components/QRScanButton';
import { WelcomeHeader } from '@/feature/main/components/WelcomeHeader';
import { useVisitorDashboard } from '@/feature/main/hooks/useVisitorDashboard';
import { useAppSelector } from '@/lib/redux/hooks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
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

  const currentMode = useAppSelector(state => state.mode.LayoutMode)

  useEffect(() => {
    if (currentMode === 'User') {
      router.replace('/(user)/UserDashboard')
    }
  }, [currentMode])


  if (isNavigating || isLoadingDepartment) {
    return (
      <View className="flex-1 bg-blue-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="flex-row justify-between items-center px-4 py-2">
        <View className="flex-1">
          <WelcomeHeader />
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(mode)')}
          className="bg-blue-100 p-2 rounded-full"
        >
          <MaterialIcons name="swap-horiz" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <DepartmentDisplay
        currentDepartment={currentDepartment}
        onDepartmentChange={handleDepartmentChange}
      />

      <QRScanButton onPress={handleQRScan} />

      <TapDetectorForMode onMultiTap={() => {
        router.push("/(mode)");
      }}
        tapCount={6}
        showToast={false}
      >
        <View className="pb-6 px-6">
          <Text className="text-gray-600 text-center text-sm font-['Poppins']">
            Department Access Portal
          </Text>
        </View>
      </TapDetectorForMode>
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