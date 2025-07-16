import { useGetAllDepartmentQuery } from '@/feature/department/api/deparmentApi';
import { Department } from '@/feature/department/api/interface';
import ActionButton from '@/feature/main/components/ActionButton';
import DepartmentCard from '@/feature/main/components/DepartmentCard';
import DepartmentSelectionModal from '@/feature/main/components/DepartmentSelectionModal';
import { useAppSelector } from '@/lib/redux/hooks';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StatusBar, Text, View } from 'react-native';

export default function Index() {
  const { ipAddress, port } = useAppSelector((state) => state.config);

  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [tempSelectedDepartment, setTempSelectedDepartment] = useState<Department | null>(null);

  useEffect(() => {
    if (!ipAddress || ipAddress === '' || !port || port === 0) {
      console.log('Config not set, redirecting to developer settings');
      router.replace('/(developer)/DeveloperSetting');
      return;
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
    console.log('Navigate to Sign In with department:', selectedDepartment);
  };

  const handleSignOut = () => {
    if (!selectedDepartment) {
      setShowDepartmentModal(true);
      return;
    }

    console.log('Navigate to Sign Out with department:', selectedDepartment);
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

  const { data: departmentData, isLoading: isLoadingDepartment } = useGetAllDepartmentQuery();

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
            <DepartmentCard department={selectedDepartment} onChange={handleDepartmentChange} />
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
            <ActionButton
              iconName="log-in"
              iconColor="#3B82F6"
              iconBg="bg-blue-100"
              title="SIGN IN"
              subtitle="Register and Sign In"
              onPress={handleSignIn}
              containerClassName="flex-1 mr-4"
            />
            <View className="w-px h-24 bg-gray-300 mx-4" />
            <ActionButton
              iconName="log-out"
              iconColor="#10B981"
              iconBg="bg-green-100"
              title="SIGN OUT"
              subtitle="Sign Out Properly"
              onPress={handleSignOut}
              containerClassName="flex-1 ml-4"
            />
          </View>
        </View>
      </View>

      <View className="pb-8 px-6">
        <Text className="text-gray-600 text-center text-sm">
          Department Access Portal
        </Text>
      </View>

      <DepartmentSelectionModal
        visible={showDepartmentModal}
        showClose={!!selectedDepartment}
        selectedDepartment={selectedDepartment}
        tempSelectedDepartment={tempSelectedDepartment}
        departmentData={departmentData}
        isLoadingDepartment={isLoadingDepartment}
        onClose={handleModalClose}
        onSelect={handleDepartmentSelect}
        onTempSelect={setTempSelectedDepartment}
      />
    </View>
  );
}