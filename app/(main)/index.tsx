import { useGetAllDepartmentQuery } from '@/feature/department/api/deparmentApi';
import { Department } from '@/feature/department/api/interface';
import { useAppSelector } from '@/lib/redux/hooks';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const { ipAddress, port } = useAppSelector((state) => state.config);
  const { LayoutMode } = useAppSelector((state) => state.mode)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [tempSelectedDepartment, setTempSelectedDepartment] = useState<Department | null>(null);
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

  const handleDepartmentSelect = () => {
    if (tempSelectedDepartment) {
      setSelectedDepartment(tempSelectedDepartment);
      setShowDepartmentModal(false);
      setTempSelectedDepartment(null);
    }
  };

  const handleDepartmentChange = () => {
    setTempSelectedDepartment(selectedDepartment);
    setShowDepartmentModal(true);
  };

  const handleModalClose = () => {
    if (selectedDepartment) {
      setShowDepartmentModal(false);
      setTempSelectedDepartment(null);
    }
  };



  const DepartmentSelectionModal = () => (
    <Modal
      visible={showDepartmentModal}
      animationType="slide"
      transparent={true}
      onRequestClose={handleModalClose}
    >
      <View className="flex-1 bg-black/30 justify-center items-center px-4">
        <View style={{ height: 500 }} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
          <View className="bg-blue-500 px-6 py-4 flex-row justify-between items-center">
            <Text className="text-white text-xl font-bold">SELECT DEPARTMENT</Text>
            {selectedDepartment && (
              <TouchableOpacity
                onPress={handleModalClose}
                className="p-2 rounded-full bg-white/20"
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={true}>
            <View className="gap-2">
              <View className="flex-row pb-3 border-b border-gray-200">
                <Text className="flex-1 text-gray-700 font-semibold text-base">Department Name</Text>
                <Text className="flex-1 ml-9 text-gray-700 font-semibold text-base">Office Name</Text>
              </View>
              {isLoadingDepartment ? (
                <View className="flex-1 justify-center items-center mt-10">
                  <ActivityIndicator size="large" color="#3B82F6" />
                </View>
              ) : (
                departmentData?.results?.map((dept) => (
                  <Pressable
                    key={dept.id}
                    onPress={() => setTempSelectedDepartment(dept)}
                    className={`flex-row items-center py-4 px-3 rounded-lg transition-colors ${tempSelectedDepartment?.id === dept.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-transparent hover:bg-gray-50'
                      }`}
                    android_ripple={{ color: '#E3F2FD' }}
                  >
                    <View className="w-6 h-6 mr-3">
                      {tempSelectedDepartment?.id === dept.id ? (
                        <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center">
                          <Ionicons name="checkmark" size={16} color="white" />
                        </View>
                      ) : (
                        <View className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                      )}
                    </View>
                    <Text className="flex-1 text-gray-800 text-base font-medium">{dept.name}</Text>
                    <Text className="flex-1 text-gray-600 text-base">{dept.officeName}</Text>
                  </Pressable>
                ))
              )}
            </View>
          </ScrollView>

          <View className="p-6 py-4 border-t border-gray-200 bg-gray-50">
            <Pressable
              onPress={handleDepartmentSelect}
              disabled={!tempSelectedDepartment}
              className={`py-4 px-6 rounded-xl ${tempSelectedDepartment
                ? 'bg-blue-500 shadow-md'
                : 'bg-gray-300'
                }`}
            >
              <Text className={`text-center font-semibold text-base ${tempSelectedDepartment ? 'text-white' : 'text-gray-500'
                }`}>
                Select Department
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

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

      <DepartmentSelectionModal />
    </View>
  );
}