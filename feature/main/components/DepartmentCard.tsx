import { Department } from '@/feature/department/api/interface';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export interface DepartmentCardProps {
  department: Department;
  onChange: () => void;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({ department, onChange }) => (
  <TouchableOpacity onPress={onChange} activeOpacity={0.7}>
    <View className="items-center bg-white px-4 py-2 rounded-lg shadow-sm">
      <Text className="text-gray-800 text-base font-semibold mb-1">
        {department.name}
      </Text>
      <Text className="text-gray-600 text-sm">
        {department.officeName}
      </Text>
      <Text className="text-blue-500 text-xs mt-1 font-medium">
        Tap to change
      </Text>
    </View>
  </TouchableOpacity>
);

export default DepartmentCard; 