import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface QRScanButtonProps {
  onPress: () => void;
}

export const QRScanButton = ({ onPress }: QRScanButtonProps) => {
  return (
    <View className="flex-1 px-6 py-4 justify-center items-center">
      <View className="bg-white rounded-3xl shadow-lg p-6 mx-2 max-w-sm w-full">
        <TouchableOpacity
          onPress={onPress}
          className="w-full"
          activeOpacity={0.8}
        >
          <View className="items-center">
            <View className="w-20 h-20 bg-blue-100 rounded-2xl items-center justify-center mb-3 shadow-sm">
              <Ionicons name="qr-code-outline" size={36} color="#3B82F6" />
            </View>
            <Text className="text-gray-800 text-lg font-['Poppins-Bold'] mb-2">
              SCAN QR CODE
            </Text>
            <Text className="text-gray-600 text-sm text-center font-['Poppins']">
              Scan visitor QR code to sign in or sign out
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}; 