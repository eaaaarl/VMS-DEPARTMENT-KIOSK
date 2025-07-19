import React from 'react';
import { ActivityIndicator, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

interface SignOutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ticketId: string;
  isLoading: boolean;
}

export default function SignOutModal({ visible, onClose, onConfirm, ticketId, isLoading }: SignOutModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center px-6"
        onPress={onClose}
      >
        {/* Modal Container */}
        <Pressable className="bg-white rounded-2xl p-8 w-full max-w-sm mx-4">
          {/* Icon */}
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center">
              <Text className="text-blue-500 text-2xl font-bold">?</Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-gray-800 text-center mb-4">
            Confirm
          </Text>

          {/* Message */}
          <Text className="text-gray-600 text-center mb-8 text-base">
            Sign out visitor with ID &quot;{ticketId}&quot;?
          </Text>

          {/* Buttons */}
          <View className="flex-row gap-4">
            <TouchableOpacity
              className="flex-1 bg-blue-500 py-3 rounded-lg"
              onPress={onConfirm}
              disabled={isLoading}
            >
              <Text className="text-white text-center font-semibold text-base">
                {isLoading ? <ActivityIndicator size="small" color="#fff" /> : 'Yes'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-red-500 py-3 rounded-lg"
              onPress={onClose}
              disabled={isLoading}
            >
              <Text className="text-white text-center font-semibold text-base">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};