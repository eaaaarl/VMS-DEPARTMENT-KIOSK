import { Department } from '@/feature/department/api/interface';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export interface DepartmentSelectionModalProps {
  visible: boolean;
  showClose: boolean;
  selectedDepartment: Department | null;
  tempSelectedDepartment: Department | null;
  departmentData: { results: Department[] } | undefined;
  isLoadingDepartment: boolean;
  onClose: () => void;
  onSelect: () => void;
  onTempSelect: (dept: Department) => void;
}

const DepartmentSelectionModal: React.FC<DepartmentSelectionModalProps> = ({
  visible,
  showClose,
  selectedDepartment,
  tempSelectedDepartment,
  departmentData,
  isLoadingDepartment,
  onClose,
  onSelect,
  onTempSelect,
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View className="flex-1 bg-black/30 justify-center items-center px-4">
      <View style={{ height: 500 }} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <View className="bg-blue-500 px-6 py-4 flex-row justify-between items-center">
          <Text className="text-white text-xl font-bold">SELECT DEPARTMENT</Text>
          {showClose && (
            <TouchableOpacity
              onPress={onClose}
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
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            ) : (
              departmentData?.results?.map((dept) => (
                <Pressable
                  key={dept.id}
                  onPress={() => onTempSelect(dept)}
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
          <TouchableOpacity
            onPress={onSelect}
            disabled={!tempSelectedDepartment}
            className={`py-4 px-6 rounded-xl ${tempSelectedDepartment
              ? 'bg-blue-500 shadow-md'
              : 'bg-gray-300'
              }`}
            activeOpacity={0.8}
          >
            <Text className={`text-center font-semibold text-base ${tempSelectedDepartment ? 'text-white' : 'text-gray-500'
              }`}>
              Select Department
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default DepartmentSelectionModal; 