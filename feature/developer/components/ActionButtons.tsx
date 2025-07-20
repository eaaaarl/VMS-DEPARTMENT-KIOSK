import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'

interface ActionButtonsProps {
  loading: boolean
  onSave: () => void
  onReset: () => void
}

export default function ActionButtons({ loading, onSave, onReset }: ActionButtonsProps) {
  return (
    <View className="flex-row gap-4 mb-8">
      <TouchableOpacity
        onPress={onSave}
        className="flex-1 bg-blue-600 rounded-lg py-4 items-center shadow-sm"
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">Save Settings</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onReset}
        className="flex-1 bg-gray-200 rounded-lg py-4 items-center"
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text className="text-gray-700 font-semibold text-base">Reset</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}