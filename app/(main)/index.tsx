import { DepartmentSelectionModal } from '@/feature/components';
import { useGetAllDepartmentQuery } from '@/feature/department/api/deparmentApi';
import { Department } from '@/feature/department/api/interface';
import { useAppSelector } from '@/lib/redux/hooks';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const { ipAddress, port } = useAppSelector((state) => state.config);
  const { LayoutMode } = useAppSelector((state) => state.mode)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const { data: departmentData, isLoading: isLoadingDepartment, isError } = useGetAllDepartmentQuery();

  useEffect(() => {
    if (!ipAddress || ipAddress === '' || !port || port === 0) {
      console.log('Config not set, redirecting to developer settings');
      router.replace('/(developer)/DeveloperSetting');
      return;
    }

    if (isError) {
      router.replace('/(developer)/DeveloperSetting')
      return
    }

    if (LayoutMode === null) {
      router.replace('/(mode)/mode')
    }

  }, [ipAddress, port]);

  useEffect(() => {
    if (!selectedDepartment) {
      setShowDepartmentModal(true);
    }
  }, [selectedDepartment]);

  const handleSignIn = () => {
    if (!selectedDepartment) {
      setShowDepartmentModal(true);
      return;
    }
    router.push(`/(visitor)/SignIn?officeId=${selectedDepartment.officeId}`);
  };

  const handleSignOut = () => {
    if (!selectedDepartment) {
      setShowDepartmentModal(true);
      return;
    }

    router.push(`/(visitor)/SignOut?department=${selectedDepartment.id}`);
  };

  const handleDepartmentSelect = (department: Department) => {
    setSelectedDepartment(department);
  };

  const handleDepartmentChange = () => {
    setShowDepartmentModal(true);
  };

  const handleModalClose = () => {
    if (selectedDepartment) {
      setShowDepartmentModal(false);
    }
  };

  const handleConfirmSelection = () => {
    setShowDepartmentModal(false);
  };

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
          {selectedDepartment ? (
            <TouchableOpacity onPress={handleDepartmentChange} activeOpacity={0.7}>
              <View className="items-center bg-white px-4 py-2 rounded-lg shadow-sm">
                <Text className="text-gray-800 text-base font-semibold mb-1">
                  {selectedDepartment.name}
                </Text>
                <Text className="text-gray-600 text-sm">
                  {selectedDepartment.officeName}
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

      <DepartmentSelectionModal
        isVisible={showDepartmentModal}
        departments={departmentData?.results}
        isLoading={isLoadingDepartment}
        selectedDepartment={selectedDepartment}
        onSelect={handleDepartmentSelect}
        onClose={handleModalClose}
        onConfirm={handleConfirmSelection}
      />
    </View>
  );
}