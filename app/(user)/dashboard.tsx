import { Department } from '@/feature/department/api/interface';
import { useAppDispatch } from '@/lib/redux/hooks';
import { setDepartmentManualEntry } from '@/lib/redux/state/departmentManualEntrySlice';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const MOCK_DEPARTMENT: Department[] = [
  {
    id: 1,
    name: 'IT Department',
    officeId: 1,
    officeName: 'Technology Services'
  },
  {
    id: 2,
    name: 'HR Department',
    officeId: 2,
    officeName: 'Human Resources'
  },
  {
    id: 3,
    name: 'Finance Department',
    officeId: 3,
    officeName: 'Finance'
  },
  {
    id: 4,
    name: 'Marketing Department',
    officeId: 4,
    officeName: 'Marketing'
  },
  {
    id: 5,
    name: 'Sales Department',
    officeId: 5,
    officeName: 'Sales'
  }
]

export default function Dashboard() {
  // Redux
  const dispatch = useAppDispatch();

  // State
  const [showDepartmentModal, setShowDepartmentModal] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // RTK Query
  // const { data: departmentData, isLoading: isLoadingDepartmentData } = useGetAllDepartmentQuery();

  useEffect(() => {
    const checkingDepartment = async () => {
      if (!selectedDepartment) {
        setShowDepartmentModal(true)
      }
    }

    checkingDepartment();
  }, [selectedDepartment])

  // Handlers
  const handleCameraScan = () => {
    router.push('/(user)/CameraScreen')
  }

  const handleManualEntry = () => {
    if (selectedDepartment) {
      dispatch(setDepartmentManualEntry(selectedDepartment));
    }
    router.push('/(user)/ManualEntryScreen')
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-6 py-4">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Dashboard
          </Text>
          <Text className="text-gray-600">
            Welcome back! Staff
          </Text>
        </View>

        <View className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <View className="flex-row items-center gap-2 mb-2">
            <FontAwesome name="building-o" size={24} color="black" />
            <Text className='text-lg font-semibold text-gray-800'>
              Your Department
            </Text>
          </View>
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-blue-600 text-xl font-bold">
              {selectedDepartment?.name || 'Select Department'}
            </Text>
          </View>
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-gray-500 mt-1">
              {selectedDepartment?.officeName || 'Select Department'}
            </Text>
          </View>
        </View>

        <View className="gap-4">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </Text>

          <TouchableOpacity
            onPress={handleCameraScan}
            className="bg-blue-600 rounded-lg p-4 flex-row items-center justify-center shadow-sm"
            activeOpacity={0.8}
          >
            <View className="bg-white rounded-full p-2 mr-3">
              <Text className="text-blue-600 text-lg">📷</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-lg">
                Camera Scan
              </Text>
              <Text className="text-blue-100 text-sm">
                Scan QR codes
              </Text>
            </View>
          </TouchableOpacity>

          {/* Manual Entry Button */}
          <TouchableOpacity
            onPress={handleManualEntry}
            className="bg-green-600 rounded-lg p-4 flex-row items-center justify-center shadow-sm"
            activeOpacity={0.8}
          >
            <View className="bg-white rounded-full p-2 mr-3">
              <Text className="text-green-600 text-lg">✏️</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-lg">
                Manual Entry
              </Text>
              <Text className="text-green-100 text-sm">
                Enter information manually
              </Text>
            </View>
          </TouchableOpacity>
        </View>

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
            </View>
            <View className="flex-row px-6 py-4 border-b border-gray-200">
              <Text className="flex-1 text-center text-gray-700 font-semibold text-base">Department Name</Text>
              <Text className="flex-1 text-center text-gray-700 font-semibold text-base">Office Name</Text>
              <Text className="w-16 text-center text-gray-700 font-semibold text-base ">Select</Text>
            </View>
            <ScrollView className="flex-1 px-6 py-4 " showsVerticalScrollIndicator={true}>
              <View className="gap-2">
                {MOCK_DEPARTMENT?.map((dept) => (
                  <TouchableOpacity
                    key={dept.id}
                    onPress={() => {
                      setSelectedDepartment(dept);
                    }}
                    activeOpacity={0.2}
                  >
                    <View className={`flex-row items-center py-4 px-3 rounded-lg ${selectedDepartment?.id === dept.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}>
                      <Text className="flex-1 text-gray-800 text-base font-medium">{dept.name}</Text>
                      <Text className="flex-1 text-center text-gray-700 text-base font-medium">{dept.officeName}</Text>

                      {/* Radio Button Indicator */}
                      <View className="w-16 items-center justify-center">
                        <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedDepartment?.id === dept.id
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
            </ScrollView>
            <View className="p-6 py-4 border-t border-gray-200 bg-gray-50">
              <TouchableOpacity
                onPress={() => {
                  if (selectedDepartment) {
                    setShowDepartmentModal(false);
                  }
                }}
                disabled={!selectedDepartment}
                className={`py-4 px-6 rounded-xl ${selectedDepartment
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
                  }`}
              >
                <Text className={`text-center font-semibold text-base ${selectedDepartment ? 'text-white' : 'text-gray-500'
                  }`}>
                  Select Department
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}