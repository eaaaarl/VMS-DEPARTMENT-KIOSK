import TapDetector from '@/components/TapDetector';
import { useGetAllDepartmentQuery } from '@/feature/department/api/deparmentApi';
import { Department } from '@/feature/department/api/interface';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { setVisitorDepartmentEntry } from '@/lib/redux/state/visitorDepartmentEntry';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function Index() {
  // Redux
  const dispatch = useAppDispatch()

  // Redux State
  const { ipAddress, port } = useAppSelector((state) => state.config);
  const { LayoutMode } = useAppSelector((state) => state.mode);

  // UI State
  const [isNavigating, setIsNavigating] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false)

  // RTK Query Hooks
  const { data: departmentData, isLoading: isLoadingDepartment, isError, refetch } = useGetAllDepartmentQuery();

  const checkingConfig = useMemo(() => {
    if (!ipAddress || ipAddress === '' || !port || port === 0) {
      return false;
    }
    return true;
  }, [ipAddress, port]);

  const checkingIfHaveDepartment = useMemo(() => {
    if (!currentDepartment && !isLoadingDepartment && departmentData) {
      return false;
    }
    return true;
  }, [currentDepartment, isLoadingDepartment, departmentData]);

  useEffect(() => {
    if (isNavigating) return;

    if (!checkingConfig) {
      setIsNavigating(true);
      router.replace('/(developer)/DeveloperSetting');
      return;
    }

    if (isError) {
      setIsNavigating(true);

      if (!checkingConfig) {
        router.replace('/(developer)/DeveloperSetting');
      } else {
        router.replace('/(error)/error-screen');
      }

      return;
    }

    if (LayoutMode === null) {
      setIsNavigating(true);
      router.replace('/(mode)');
      return;
    }

  }, [checkingConfig, LayoutMode, isError, isNavigating, checkingIfHaveDepartment]);

  useEffect(() => {
    if (isNavigating) return;

    if (!checkingIfHaveDepartment) {
      setShowDepartmentModal(true);
      return;
    }
  }, [checkingIfHaveDepartment, isNavigating]);


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

  const handleDepartmentSelect = (dept: Department) => {
    setCurrentDepartment(prev => {
      if (prev && prev.id === dept.id) {
        return null;
      }
      return dept;
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
    } catch (error) {
      console.log(error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isNavigating || isLoadingDepartment) {
    return (
      <View className="flex-1 bg-blue-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="pt-8 pb-4 px-6 max-w-2xl mx-auto">
        <Text className="text-gray-600 text-lg font-['Poppins-Medium'] text-center mb-2">
          Welcome to
        </Text>
        <Text className="text-gray-600 text-3xl font-['Poppins-Bold'] text-center mb-6">
          Visitors Management System
        </Text>

        <View className="items-center mb-4">
          <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-3 shadow-sm">
            <Ionicons name="business" size={36} color="#3B82F6" />
          </View>
          {currentDepartment ? (
            <View className="relative">
              <View className="items-center bg-white px-8 py-3 rounded-lg shadow-sm">
                <Text className="text-gray-800 text-xl font-['Poppins-SemiBold'] mb-1">
                  {currentDepartment.name}
                </Text>
                <Text className="text-gray-600 text-base font-['Poppins']">
                  {currentDepartment.officeName}
                </Text>
              </View>
              <TapDetector
                onMultiTap={handleDepartmentChange}
                tapCount={5}
                showToast={true}
              />
            </View>
          ) : (
            <Text className="text-gray-600 text-xl font-['Poppins-Medium']">
              Department Portal
            </Text>
          )}
        </View>
      </View>

      <View className="flex-1 px-6 py-4 justify-center items-center">
        <View className="bg-white rounded-3xl shadow-lg p-6 mx-2 max-w-sm w-full">
          <TouchableOpacity
            onPress={() => {
              if (!currentDepartment) {
                setShowDepartmentModal(true);
                return;
              }
              dispatch(setVisitorDepartmentEntry(currentDepartment));
              router.push(`/(visitor)/VisitorCameraScreen`);
            }}
            className="w-full"
            activeOpacity={0.8}
          >
            <View className="items-center">
              <View className="w-20 h-20 bg-blue-100 rounded-2xl items-center justify-center mb-3 shadow-sm">
                <Ionicons name="qr-code-outline" size={36} color="#3B82F6" />
              </View>
              <Text className="text-gray-800 text-lg font-['Poppins-Bold'] mb-2">
                SCAN QR CODE
              </Text>
              <Text className="text-gray-600 text-sm text-center font-['Poppins']">
                Scan visitor QR code to sign in or sign out
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View className="pb-6 px-6">
        <Text className="text-gray-600 text-center text-sm font-['Poppins']">
          Department Access Portal
        </Text>
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
              <Text className="text-white text-xl font-['Poppins-Bold']">SELECT DEPARTMENT</Text>
              <TouchableOpacity
                onPress={() => setShowDepartmentModal(false)}
                className="p-2 rounded-full bg-white/20"
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <View className="flex-row px-6 py-4 border-b border-gray-200">
              <Text className="flex-1 text-center text-gray-700 font-['Poppins-SemiBold'] text-base">Department Name</Text>
              <Text className="flex-1 text-center text-gray-700 font-['Poppins-SemiBold'] text-base">Office Name</Text>
              <Text className="w-16 text-center text-gray-700 font-['Poppins-SemiBold'] text-base"></Text>
            </View>
            <ScrollView className="flex-1"
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={['#3B82F6']} // Blue color to match your theme
                  tintColor="#3B82F6" // For iOS
                  progressBackgroundColor="#ffffff" // White background for the refresh indicator
                  progressViewOffset={10} // Adjust position of the spinner
                />
              }
            >
              <View className="gap-3 py-4 px-4">
                {departmentData?.results?.map((dept) => (
                  <TouchableOpacity
                    key={dept.id}
                    onPress={() => {
                      handleDepartmentSelect(dept);
                    }}
                    activeOpacity={0.2}
                  >
                    <View className={`flex-row items-center py-4 px-3 border border-gray-300 rounded-lg ${currentDepartment?.id === dept.id ? 'bg-blue-50 border border-blue-300' : 'bg-gray-50'
                      }`}>
                      <Text className="flex-1 text-gray-800 text-base font-['Poppins-Medium']">{dept.name}</Text>
                      <Text className="flex-1 text-center text-gray-700 text-base font-['Poppins-Medium']">{dept.officeName}</Text>

                      {/* Radio Button Indicator */}
                      <View className="w-16 items-center justify-center">
                        <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${currentDepartment?.id === dept.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 bg-white'
                          }`}>
                          {currentDepartment?.id === dept.id && (
                            <View className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <View className="p-6 py-4 border-t border-gray-200 bg-gray-50">
              <TouchableOpacity
                onPress={() => {
                  if (currentDepartment) {
                    setShowDepartmentModal(false);
                  }
                }}
                disabled={!currentDepartment}
                className={`py-4 px-6 rounded-xl ${currentDepartment
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
                  }`}
              >
                <Text className={`text-center font-['Poppins-SemiBold'] text-base ${currentDepartment ? 'text-white' : 'text-gray-500'
                  }`}>
                  Select Department
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}