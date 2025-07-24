import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface QuickActionsProps {
  onCameraScan: () => void;
  onManualEntry: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onCameraScan,
  onManualEntry,
}) => {
  return (
    <View className="gap-4">
      <Text className="text-lg font-semibold text-gray-800 mb-4">
        Quick Actions
      </Text>

      <TouchableOpacity
        onPress={onCameraScan}
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

      <TouchableOpacity
        onPress={onManualEntry}
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
  );
};

export default QuickActions; 