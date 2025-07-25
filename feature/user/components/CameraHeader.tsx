import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface CameraHeaderProps {
  onBack: () => void;
  cameraEnabled: boolean;
  onToggleCamera: () => void;
}

const CameraHeader: React.FC<CameraHeaderProps> = ({
  onBack,
  cameraEnabled,
  onToggleCamera
}) => {
  return (
    <View className="bg-white px-6 py-4 border-b border-gray-200">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onBack}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800">
          QR Code Scanner
        </Text>
        <TouchableOpacity
          onPress={onToggleCamera}
          className="p-2"
        >
          <Ionicons
            name={cameraEnabled ? "camera" : "camera-outline"}
            size={24}
            color="#374151"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CameraHeader;