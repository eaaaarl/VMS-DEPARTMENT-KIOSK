import { VisitorLog } from '@/feature/visitor/api/inteface';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface VisitorInformationModalProps {
  visible: boolean
  onClose: () => void
  currentVisitorLog: VisitorLog | null
  purpose: string
  handleChangePurpose: (purpose: string) => void
  image?: string;
  onSubmitVisitorLog: () => void;
}

const VisitorInformationModal = ({ visible, onClose, currentVisitorLog, purpose, handleChangePurpose, image, onSubmitVisitorLog }: VisitorInformationModalProps) => {
  console.log('VisitorInformationModal', image)
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-5">
        <View className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
          {/* Header */}
          <View className="bg-green-500 py-4 px-5 flex-row justify-center items-center relative">
            <Text className="text-white text-xl font-bold">{currentVisitorLog?.strId}</Text>
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-4 p-1"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Photo Placeholders */}
          <View className="flex-row p-4 gap-3">
            <View className="flex-1">
              <Text className="text-sm font-semibold mb-2 text-gray-800">ID Photo</Text>
              <View className="h-28 bg-gray-100 rounded-lg justify-center items-center relative border-2 border-red-500">
                <View className="w-14 h-10 justify-center items-center">
                  <View className="w-12 h-8 bg-white rounded border-2 border-gray-800 p-1 relative">
                    <View className="h-0.5 bg-gray-800 mb-0.5 w-3/4" />
                    <View className="h-0.5 bg-gray-800 mb-0.5 w-3/4" />
                    <View className="h-0.5 bg-gray-800 mb-0.5 w-3/4" />
                    <View className="absolute right-0.5 bottom-0.5 w-3 h-3 bg-gray-800 rounded-full" />
                  </View>
                </View>
                {/* Red prohibition overlay */}
                <View className="absolute inset-0 justify-center items-center">
                  <View className="w-20 h-20 border-4 border-red-500 rounded-full" />
                  <View className="absolute w-16 h-0.5 bg-red-500 rotate-45" />
                </View>
              </View>
            </View>

            <View className="flex-1">
              <Text className="text-sm font-semibold mb-2 text-gray-800">Face Photo</Text>
              <View className="h-28 bg-gray-100 rounded-lg justify-center items-center relative border-2 border-orange-400">
                <View className="w-12 h-12 justify-center items-center">
                  <View className="w-10 h-10 bg-gray-500 rounded-full" />
                </View>
                {/* Red prohibition overlay */}
                <View className="absolute inset-0 justify-center items-center">
                  <View className="w-20 h-20 border-4 border-red-500 rounded-full" />
                  <View className="absolute w-16 h-0.5 bg-red-500 rotate-45" />
                </View>
              </View>
            </View>
          </View>

          {/* Visitor Information */}
          <View className="bg-blue-50 mx-4 mb-4 rounded-lg p-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-600 text-sm">Visitors Name</Text>
              <Text className="text-gray-800 font-semibold text-sm">{currentVisitorLog?.name}</Text>
            </View>

            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-600 text-sm">Mobile Number :</Text>
              <Text className="text-gray-800 font-semibold text-sm">{currentVisitorLog?.contactNo1}</Text>
            </View>

            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-600 text-sm">Office visited :</Text>
              <Text className="text-gray-800 font-semibold text-sm">{currentVisitorLog?.officeName}</Text>
            </View>

            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-600 text-sm">Reason of visit :</Text>
              <Text className="text-gray-800 font-semibold text-sm">{currentVisitorLog?.service}</Text>
            </View>

            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-600 text-sm">Time In :</Text>
              <Text className="text-gray-800 font-semibold text-sm">{currentVisitorLog?.timeIn}</Text>
            </View>

            <View className="mb-4">
              <Text className="text-gray-600 text-sm mb-2">Purpose :</Text>
              <View className="relative">
                <TextInput
                  className="bg-white border border-gray-300 rounded-lg p-3 pr-20 text-sm text-gray-800 min-h-[80px]"
                  placeholder="Specify Purpose"
                  placeholderTextColor="#999"
                  value={purpose}
                  onChangeText={handleChangePurpose}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <TouchableOpacity className="bg-blue-500 rounded-lg py-3 justify-center items-center" onPress={onSubmitVisitorLog}>
              <Text className="text-white font-semibold text-base">Enter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default VisitorInformationModal;