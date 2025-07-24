import { Department } from '@/feature/department/api/interface';
import React from 'react';
import { ActivityIndicator, Modal, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface DepartmentSelectorProps {
  visible: boolean;
  onClose: () => void;
  departments: Department[];
  selectedDepartment: Department | null;
  onSelectDepartment: (department: Department) => void;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
}

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
  visible,
  onClose,
  departments,
  selectedDepartment,
  onSelectDepartment,
  isLoading,
  isRefreshing,
  onRefresh,
}) => {
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
            <Text className="text-white text-xl font-bold">SELECT DEPARTMENT</Text>
          </View>
          <View className="flex-row px-6 py-4 border-b border-gray-200">
            <Text className="flex-1 text-center text-gray-700 font-semibold text-base">Department Name</Text>
            <Text className="flex-1 text-center text-gray-700 font-semibold text-base">Office Name</Text>
            <Text className="w-16 text-center text-gray-700 font-semibold text-base "></Text>
          </View>
          <ScrollView 
            className="flex-1" 
            showsVerticalScrollIndicator={true}
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
            {isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            ) : (
              <View className="gap-2 px-4 py-4">
                {departments?.map((dept) => (
                  <TouchableOpacity
                    key={dept.id}
                    onPress={() => onSelectDepartment(dept)}
                    activeOpacity={0.2}
                  >
                    <View className={`flex-row items-center border border-gray-200 py-4 px-3 rounded-lg ${
                      selectedDepartment?.id === dept.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                    }`}>
                      <Text className="flex-1 text-gray-800 text-base font-medium">{dept.name}</Text>
                      <Text className="flex-1 text-center text-gray-700 text-base font-medium">{dept.officeName}</Text>

                      <View className="w-16 items-center justify-center">
                        <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                          selectedDepartment?.id === dept.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 bg-white'
                        }`}>
                          {selectedDepartment?.id === dept.id && (
                            <View className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
          <View className="p-6 py-4 border-t border-gray-200 bg-gray-50">
            <TouchableOpacity
              onPress={onClose}
              disabled={!selectedDepartment}
              className={`py-4 px-6 rounded-xl ${
                selectedDepartment
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
              }`}
            >
              <Text className={`text-center font-semibold text-base ${
                selectedDepartment ? 'text-white' : 'text-gray-500'
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

export default DepartmentSelector; 