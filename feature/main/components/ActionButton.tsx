import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export interface ActionButtonProps {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  containerClassName?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  iconName,
  iconColor,
  iconBg,
  title,
  subtitle,
  onPress,
  containerClassName = '',
}) => (
  <TouchableOpacity onPress={onPress} className={containerClassName} activeOpacity={0.8}>
    <View className="items-center">
      <View className={`w-20 h-20 ${iconBg} rounded-2xl items-center justify-center mb-4 shadow-sm`}>
        <Ionicons name={iconName} size={32} color={iconColor} />
      </View>
      <Text className="text-gray-800 text-xl font-bold mb-2">
        {title}
      </Text>
      <Text className="text-gray-600 text-sm text-center">
        {subtitle}
      </Text>
    </View>
  </TouchableOpacity>
);

export default ActionButton; 