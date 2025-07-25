import TapDetector from '@/components/TapDetector';
import { Department } from '@/feature/department/api/interface';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Text, View } from 'react-native';

interface DepartmentDisplayProps {
  currentDepartment: Department | null;
  onDepartmentChange: () => void;
}

export const DepartmentDisplay = ({ currentDepartment, onDepartmentChange }: DepartmentDisplayProps) => {
  return (
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
            onMultiTap={onDepartmentChange}
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
  );
}; 