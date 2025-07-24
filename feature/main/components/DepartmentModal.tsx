import { Department } from '@/feature/department/api/interface';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface DepartmentModalProps {
  visible: boolean;
  onClose: () => void;
  departments: Department[];
  currentDepartment: Department | null;
  onDepartmentSelect: (dept: Department) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const DepartmentModal = ({
  visible,
  onClose,
  departments,
  currentDepartment,
  onDepartmentSelect,
  isRefreshing,
  onRefresh,
}: DepartmentModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/30 justify-center items-center px-4">
        <View style={{ height: 500 }} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
          <View className="bg-blue-500 px-6 py-4 flex-row justify-between items-center">
            <Text className="text-white text-xl font-['Poppins-Bold']">SELECT DEPARTMENT</Text>
            <TouchableOpacity
              onPress={onClose}
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
                onRefresh={onRefresh}
                colors={['#3B82F6']}
                tintColor="#3B82F6"
                progressBackgroundColor="#ffffff"
                progressViewOffset={10}
              />
            }
          >
            <View className="gap-3 py-4 px-4">
              {departments?.map((dept) => (
                <TouchableOpacity
                  key={dept.id}
                  onPress={() => onDepartmentSelect(dept)}
                  activeOpacity={0.2}
                >
                  <View className={`flex-row items-center py-4 px-3 border border-gray-300 rounded-lg ${
                    currentDepartment?.id === dept.id ? 'bg-blue-50 border border-blue-300' : 'bg-gray-50'
                  }`}>
                    <Text className="flex-1 text-gray-800 text-base font-['Poppins-Medium']">{dept.name}</Text>
                    <Text className="flex-1 text-center text-gray-700 text-base font-['Poppins-Medium']">{dept.officeName}</Text>

                    <View className="w-16 items-center justify-center">
                      <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        currentDepartment?.id === dept.id
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
              onPress={onClose}
              disabled={!currentDepartment}
              className={`py-4 px-6 rounded-xl ${
                currentDepartment
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
              }`}
            >
              <Text className={`text-center font-['Poppins-SemiBold'] text-base ${
                currentDepartment ? 'text-white' : 'text-gray-500'
              }`}>
                Select Department
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}; 