import React from 'react'
import { Modal, Text, TouchableOpacity, View } from 'react-native'


interface DifferentOfficeModalProps {
  visible: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export const DifferentOfficeModal: React.FC<DifferentOfficeModalProps> = ({
  visible,
  message,
  onConfirm,
  onCancel
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-lg">
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center border-2 border-orange-200">
              <Text className="text-orange-500 text-2xl font-bold">!</Text>
            </View>
          </View>

          <Text className="text-gray-800 text-xl font-semibold text-center mb-4">
            Visitor
          </Text>

          <Text className="text-gray-600 text-base text-center leading-6 mb-8">
            {message}
          </Text>

          <View className="flex-row gap-4">
            <TouchableOpacity
              className="flex-1 bg-blue-500 py-3 rounded-lg"
              onPress={onConfirm}
            >
              <Text className="text-white text-center font-medium text-base">
                Yes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-red-500 py-3 rounded-lg"
              onPress={onCancel}
            >
              <Text className="text-white text-center font-medium text-base">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
} 