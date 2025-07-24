import TapDetector from '@/components/TapDetector';
import { Department } from '@/feature/department/api/interface';
import React from 'react';
import { Text, View } from 'react-native';

interface DepartmentInfoProps {
  department: Department | null;
  onDepartmentChange: () => void;
}

const DepartmentInfo: React.FC<DepartmentInfoProps> = ({
  department,
  onDepartmentChange,
}) => {
  return (
    <View className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <TapDetector onMultiTap={onDepartmentChange} tapCount={5} showToast={true} />
      <Text className="text-gray-700 font-medium mb-3">Current Location</Text>
      <View className="flex-row items-center gap-3 mb-3">
        <View className="bg-blue-100 rounded-full p-2">
          <Text className="text-blue-600 text-lg">🏢</Text>
        </View>
        <View>
          <Text className="text-gray-600 text-sm">Department Name:</Text>
          <Text className="text-blue-600 text-xl font-bold">
            {department?.name || 'Not Selected'}
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
            {department?.officeName || 'Not Selected'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default DepartmentInfo; 