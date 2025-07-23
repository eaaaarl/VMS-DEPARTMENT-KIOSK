import TapDetector from '@/components/TapDetector';
import { useGetAllDepartmentQuery } from '@/feature/department/api/deparmentApi';
import { Department } from '@/feature/department/api/interface';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { setDepartmentCameraEntry } from '@/lib/redux/state/departmentCameraEntrySlice';
import { setDepartmentManualEntry } from '@/lib/redux/state/departmentManualEntrySlice';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function Dashboard() {
  // Redux
  const dispatch = useAppDispatch();

  // State
  const [showDepartmentModal, setShowDepartmentModal] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  //Redux State
  const { ipAddress, port } = useAppSelector((state) => state.config)

  // RTK Query
  const {
    data: departmentData,
    isLoading: isLoadingDepartmentData,
    isError: isErrorDepartmentData,
    refetch: refetchDepartmentData
  } = useGetAllDepartmentQuery();

  // Memo
  const checkingIfHaveDepartment = useMemo(() => {
    if (!selectedDepartment && !isLoadingDepartmentData && departmentData) {
      return false;
    }
    return true;
  }, [selectedDepartment, isLoadingDepartmentData, departmentData]);

  const checkingConfig = useMemo(() => {
    if (!ipAddress || ipAddress === '' || !port || port === 0) {
      return false;
    }
    return true;
  }, [ipAddress, port]);

  // Effect
  useEffect(() => {
    if (isNavigating) return;

    if (isErrorDepartmentData) {
      setIsNavigating(true);
      router.replace('/(error)/error-screen');
      return;
    }

    if (!checkingConfig) {
      setIsNavigating(true);
      router.replace('/(developer)/DeveloperSetting')
      return
    }

  }, [isNavigating, isErrorDepartmentData, checkingConfig])

  useEffect(() => {
    if (isNavigating) return;

    if (!checkingIfHaveDepartment) {
      setShowDepartmentModal(true);
      return;
    }
  }, [checkingIfHaveDepartment, isNavigating]);

  // Handlers
  const handleCameraScan = () => {
    if (!selectedDepartment) {
      Toast.show({
        type: 'error',
        text1: 'Department Selection Required',
        text2: 'Please select a department before proceeding',
      });

      return;
    }

    dispatch(setDepartmentCameraEntry(selectedDepartment));
    router.push('/(user)/CameraScreen')
  }

  const handleManualEntry = () => {
    if (!selectedDepartment) {
      Toast.show({
        type: 'error',
        text1: 'Department Selection Required',
        text2: 'Please select a department before proceeding',
      });

      return;
    }

    dispatch(setDepartmentManualEntry(selectedDepartment));
    router.push('/(user)/ManualEntryScreen')
  }

  const handleDepartmentChange = useCallback(() => {
    // This function is now triggered after 5 taps on the department display
    setShowDepartmentModal(true);
    Toast.show({
      type: 'success',
      position: 'top',
      text1: 'Admin Access',
      text2: 'Department selection mode activated',
      visibilityTime: 2000,
    });
  }, []);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refetchDepartmentData();
    } catch (error) {
      console.log(error);
    } finally {
      setIsRefreshing(false);
    }
  }


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

        <View className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <TapDetector onMultiTap={handleDepartmentChange} tapCount={5} showToast={true} />
          <Text className="text-gray-700 font-medium mb-3">Current Location</Text>
          <View className="flex-row items-center gap-3 mb-3">
            <View className="bg-blue-100 rounded-full p-2">
              <Text className="text-blue-600 text-lg">🏢</Text>
            </View>
            <View>
              <Text className="text-gray-600 text-sm">Department Name:</Text>
              <Text className="text-blue-600 text-xl font-bold">
                {selectedDepartment?.name || 'Not Selected'}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3 mb-1">
            <View className="bg-blue-100 rounded-full p-2">
              <Text className="text-blue-600 text-lg">📍</Text>
            </View>
            <View>
              <Text className="text-gray-600 text-sm">Office Name:</Text>
              <Text className="text-gray-700 font-medium">
                {selectedDepartment?.officeName || 'Not Selected'}
              </Text>
            </View>
          </View>
        </View>

        <View className="gap-4">

          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </Text>

          <TouchableOpacity
            onPress={handleCameraScan}
            className="bg-blue-600 rounded-lg p-4 flex-row items-center justify-center shadow-sm"
            activeOpacity={0.8}
          >
            <View className="bg-white rounded-full p-2 mr-3">
              <Text className="text-blue-600 text-lg">📷</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-lg">
                Camera Scan
              </Text>
              <Text className="text-blue-100 text-sm">
                Scan QR codes
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleManualEntry}
            className="bg-green-600 rounded-lg p-4 flex-row items-center justify-center shadow-sm"
            activeOpacity={0.8}
          >
            <View className="bg-white rounded-full p-2 mr-3">
              <Text className="text-green-600 text-lg">✏️</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-lg">
                Manual Entry
              </Text>
              <Text className="text-green-100 text-sm">
                Enter information manually
              </Text>
            </View>
          </TouchableOpacity>
        </View>

      </View>

      <Modal
        visible={showDepartmentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDepartmentModal(false)}
      >
        <View className="flex-1 bg-black/30 justify-center items-center px-4">
          <View style={{ height: 500 }} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <View className="bg-blue-500 px-6 py-4 flex-row justify-between items-center">
              <Text className="text-white text-xl font-bold">SELECT DEPARTMENT</Text>
            </View>
            <View className="flex-row px-6 py-4 border-b border-gray-200">
              <Text className="flex-1 text-center text-gray-700 font-semibold text-base">Department Name</Text>
              <Text className="flex-1 text-center text-gray-700 font-semibold text-base">Office Name</Text>
              <Text className="w-16 text-center text-gray-700 font-semibold text-base "></Text>
            </View>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={true}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={['#3B82F6']} // Blue color to match your theme
                  tintColor="#3B82F6" // For iOS
                  progressBackgroundColor="#ffffff" // White background for the refresh indicator
                  progressViewOffset={10}
                />
              }
            >
              {isLoadingDepartmentData ? (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator size="large" color="#0000ff" />
                </View>
              ) : (
                <View className="gap-2 px-4 py-4">
                  {departmentData?.results.map((dept) => (
                    <TouchableOpacity
                      key={dept.id}
                      onPress={() => {
                        setSelectedDepartment(dept);
                      }}
                      activeOpacity={0.2}
                    >
                      <View className={`flex-row items-center border border-gray-200 py-4 px-3 rounded-lg ${selectedDepartment?.id === dept.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                        }`}>
                        <Text className="flex-1 text-gray-800 text-base font-medium">{dept.name}</Text>
                        <Text className="flex-1 text-center text-gray-700 text-base font-medium">{dept.officeName}</Text>

                        <View className="w-16 items-center justify-center">
                          <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedDepartment?.id === dept.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 bg-white'
                            }`}>
                            {selectedDepartment?.id === dept.id && (
                              <View className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
            <View className="p-6 py-4 border-t border-gray-200 bg-gray-50">
              <TouchableOpacity
                onPress={() => {
                  if (selectedDepartment) {
                    setShowDepartmentModal(false);
                  }
                }}
                disabled={!selectedDepartment}
                className={`py-4 px-6 rounded-xl ${selectedDepartment
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
                  }`}
              >
                <Text className={`text-center font-semibold text-base ${selectedDepartment ? 'text-white' : 'text-gray-500'
                  }`}>
                  Select Department
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView >
  )
}