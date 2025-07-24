import React from 'react';
import { Text, View } from 'react-native';

export const WelcomeHeader = () => {
  return (
    <View className="pt-8 pb-4 px-6 max-w-2xl mx-auto">
      <Text className="text-gray-600 text-lg font-['Poppins-Medium'] text-center mb-2">
        Welcome to
      </Text>
      <Text className="text-gray-600 text-3xl font-['Poppins-Bold'] text-center mb-6">
        Visitors Management System
      </Text>
    </View>
  );
}; 