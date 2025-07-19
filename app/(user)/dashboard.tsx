import React from 'react'
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native'

export default function Dashboard() {
  const handleCameraScan = () => {
    console.log('Navigate to Camera Scan')
  }

  const handleManualEntry = () => {
    console.log('Navigate to Manual Entry')
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-6 py-4">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Dashboard
          </Text>
          <Text className="text-gray-600">
            Welcome back!
          </Text>
        </View>

        <View className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Your Department
          </Text>
          <Text className="text-blue-600 text-xl font-bold">
            IT Department
          </Text>
          <Text className="text-gray-500 mt-1">
            Technology Services
          </Text>
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

        {/* Stats or Additional Info */}
        <View className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <Text className="text-gray-800 font-semibold mb-3">
            Recent Activity
          </Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600">Today&apos;s Entries</Text>
            <Text className="text-blue-600 font-bold">12</Text>
          </View>
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-gray-600">This Week</Text>
            <Text className="text-green-600 font-bold">47</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}