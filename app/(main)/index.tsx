import { useGetAllDepartmentQuery } from '@/feature/department/api/deparmentApi';
import { Department } from '@/feature/department/api/interface';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { setSelectedDepartment } from '@/lib/redux/state/departmentSlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const dispatch = useAppDispatch()
  const { ipAddress, port } = useAppSelector((state) => state.config);
  const { LayoutMode } = useAppSelector((state) => state.mode);
  const { currentDepartment } = useAppSelector((state) => state.department);
  const [isNavigating, setIsNavigating] = useState(false);
  const { data: departmentData, isLoading: isLoadingDepartment, isError } = useGetAllDepartmentQuery();
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);


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
      router.replace('/(mode)/mode');
      return;
    }

  }, [checkingConfig, LayoutMode, isError, isNavigating, checkingIfHaveDepartment]);

  useEffect(() => {
    if (isNavigating) return;

    if (!checkingIfHaveDepartment) {
      setShowDepartmentModal(true);
    }
  }, [checkingIfHaveDepartment, isNavigating]);

  const handleSignIn = useCallback(() => {
    if (!currentDepartment) {
      setShowDepartmentModal(true);
      return;
    }
    router.push(`/(visitor)/SignIn?officeId=${currentDepartment.officeId}`);
  }, [currentDepartment]);

  const handleSignOut = useCallback(() => {
    if (!currentDepartment) {
      setShowDepartmentModal(true);
      return;
    }

    router.push({
      pathname: '/(visitor)/SignOut',
      params: { department: currentDepartment.id.toString() }
    });
  }, [currentDepartment]);

  const handleDepartmentChange = useCallback(() => {
    setShowDepartmentModal(true);
  }, []);

  const handleDepartmentSelect = (dept: Department) => {
    dispatch(setSelectedDepartment(dept))
  };

  if (isNavigating || isLoadingDepartment) {
    return (
      <View className="flex-1 bg-blue-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-blue-50">
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

      <View className="pt-16 pb-8 px-6">
        <Text className="text-gray-600 text-lg font-medium text-center mb-2">
          Welcome to
        </Text>
        <Text className="text-gray-600 text-2xl font-bold text-center mb-8">
          Visitors Management System
        </Text>

        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-4 shadow-sm">
            <Ionicons name="business" size={40} color="#3B82F6" />
          </View>
          {currentDepartment ? (
            <TouchableOpacity onPress={handleDepartmentChange} activeOpacity={0.7}>
              <View className="items-center bg-white px-4 py-2 rounded-lg shadow-sm">
                <Text className="text-gray-800 text-base font-semibold mb-1">
                  {currentDepartment.name}
                </Text>
                <Text className="text-gray-600 text-sm">
                  {currentDepartment.officeName}
                </Text>
                <Text className="text-blue-500 text-xs mt-1 font-medium">
                  Tap to change
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <Text className="text-gray-600 text-base font-medium">
              Department Portal
            </Text>
          )}
        </View>
      </View>

      <View className="flex-1 px-6 py-8">
        <View className="bg-white rounded-3xl shadow-lg p-8 mx-2">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity
              onPress={handleSignIn}
              className="flex-1 mr-4"
              activeOpacity={0.8}
            >
              <View className="items-center">
                <View className="w-20 h-20 bg-blue-100 rounded-2xl items-center justify-center mb-4 shadow-sm">
                  <Ionicons name="log-in" size={32} color="#3B82F6" />
                </View>
                <Text className="text-gray-800 text-xl font-bold mb-2">
                  SIGN IN
                </Text>
                <Text className="text-gray-600 text-sm text-center">
                  Register and Sign In
                </Text>
              </View>
            </TouchableOpacity>

            <View className="w-px h-24 bg-gray-300 mx-4" />

            <TouchableOpacity
              onPress={handleSignOut}
              className="flex-1 ml-4"
              activeOpacity={0.8}
            >
              <View className="items-center">
                <View className="w-20 h-20 bg-green-100 rounded-2xl items-center justify-center mb-4 shadow-sm">
                  <Ionicons name="log-out" size={32} color="#10B981" />
                </View>
                <Text className="text-gray-800 text-xl font-bold mb-2">
                  SIGN OUT
                </Text>
                <Text className="text-gray-600 text-sm text-center">
                  Sign Out Properly
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="pb-8 px-6">
        <Text className="text-gray-600 text-center text-sm">
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
              <Text className="text-white text-xl font-bold">SELECT DEPARTMENT</Text>
              <TouchableOpacity
                onPress={() => setShowDepartmentModal(false)}
                className="p-2 rounded-full bg-white/20"
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <View className="flex-row px-6 py-4 border-b border-gray-200">
              <Text className="flex-1 text-center text-gray-700 font-semibold text-base">Department Name</Text>
              <Text className="flex-1 text-center text-gray-700 font-semibold text-base">Office Name</Text>
              <Text className="w-16 text-center text-gray-700 font-semibold text-base">Select</Text>
            </View>
            <ScrollView className="flex-1 px-6 py-4">
              <View className="gap-2">
                {departmentData?.results?.map((dept) => (
                  <TouchableOpacity
                    key={dept.id}
                    onPress={() => {
                      handleDepartmentSelect(dept);
                    }}
                    activeOpacity={0.2}
                  >
                    <View className={`flex-row items-center py-4 px-3 rounded-lg ${currentDepartment?.id === dept.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}>
                      <Text className="flex-1 text-gray-800 text-base font-medium">{dept.name}</Text>
                      <Text className="flex-1 text-center text-gray-700 text-base font-medium">{dept.officeName}</Text>

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
                <Text className={`text-center font-semibold text-base ${currentDepartment ? 'text-white' : 'text-gray-500'
                  }`}>
                  Select Department
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View >
  );
}