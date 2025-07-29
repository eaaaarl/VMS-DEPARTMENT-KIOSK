import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native'

interface ActionButtonsProps {
  loading: boolean
  onSave: () => void
  onReset: () => void
}

export default function ActionButtons({ loading, onSave, onReset }: ActionButtonsProps) {
  const { width, height } = useWindowDimensions()
  const isLandscape = width > height

  return (
    <View 
      className="flex-row gap-4 mb-8"
      style={{
        gap: isLandscape ? 16 : 16,
        marginBottom: isLandscape ? 16 : 32,
      }}
    >
      <TouchableOpacity
        onPress={onSave}
        className="flex-1 bg-blue-600 rounded-lg items-center shadow-sm"
        style={{
          paddingVertical: isLandscape ? 16 : 16,
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text 
            className="text-white font-semibold"
            style={{ fontSize: isLandscape ? 18 : 16 }}
          >
            Save Settings
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onReset}
        className="flex-1 bg-gray-200 rounded-lg items-center"
        style={{
          paddingVertical: isLandscape ? 16 : 16,
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text 
            className="text-gray-700 font-semibold"
            style={{ fontSize: isLandscape ? 18 : 16 }}
          >
            Reset
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )
}