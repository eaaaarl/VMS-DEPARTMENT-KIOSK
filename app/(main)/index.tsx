import { useAppSelector } from '@/lib/redux/hooks';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const { ipAddress, port } = useAppSelector((state) => state.config);

  useEffect(() => {
    if (!ipAddress || ipAddress === '' || !port || port === 0) {
      console.log('Config not set, redirecting to developer settings');
      router.replace('/(developer)/DeveloperSetting');
      return;
    }
  }, [ipAddress, port]);

  const handleSignIn = () => {
    // Navigate to sign in screen
    console.log('Navigate to Sign In');
  };

  const handleSignOut = () => {
    // Navigate to sign out screen
    console.log('Navigate to Sign Out');
  };

  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

      <View className="pt-16 pb-8 px-6">
        <Text className="text-gray-600 text-lg font-medium text-center mb-2">
          Welcome to
        </Text>
        <Text className="text-gray-600 text-2xl font-bold text-center mb-8">
          Visitors Management System
        </Text>

        {/* Department Badge/Logo */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-4">
            <Ionicons name="business" size={40} color="#3B82F6" />
          </View>
          <Text className="text-gray-600 text-base font-medium">
            Department Portal
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6">
        <View className="bg-white/95 rounded-3xl shadow-lg p-8 mx-2">
          <View className="flex-row justify-between items-center">

            {/* Sign In Section */}
            <TouchableOpacity
              onPress={handleSignIn}
              className="flex-1 mr-4"
              activeOpacity={0.8}
            >
              <View className="items-center">
                <View className="w-20 h-20 bg-blue-100 rounded-2xl items-center justify-center mb-4">
                  <Ionicons name="log-in" size={32} color="#3B82F6" />
                </View>
                <Text className="text-gray-800 text-xl font-bold mb-2">
                  SIGN IN
                </Text>
                <Text className="text-gray-600 text-sm text-center">
                  Register and Sign In
                </Text>
              </View>
            </TouchableOpacity>

            {/* Divider */}
            <View className="w-px h-24 bg-gray-300 mx-4" />

            {/* Sign Out Section */}
            <TouchableOpacity
              onPress={handleSignOut}
              className="flex-1 ml-4"
              activeOpacity={0.8}
            >
              <View className="items-center">
                <View className="w-20 h-20 bg-green-100 rounded-2xl items-center justify-center mb-4">
                  <Ionicons name="log-out" size={32} color="#10B981" />
                </View>
                <Text className="text-gray-800 text-xl font-bold mb-2">
                  SIGN OUT
                </Text>
                <Text className="text-gray-600 text-sm text-center">
                  Sign Out Properly
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View className="pb-8 px-6">
        <Text className="text-gray-600 text-center text-sm">
          Department Access Portal
        </Text>
      </View>
    </View>
  );
}