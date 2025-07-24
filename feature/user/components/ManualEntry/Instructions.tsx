import React from 'react'
import { Text, View } from 'react-native'

export const Instructions: React.FC = () => {
  return (
    <View className="bg-blue-50 rounded-lg p-4 border border-blue-200">
      <Text className="text-blue-800 font-semibold mb-2">
        Instructions:
      </Text>
      <Text className="text-blue-700 text-sm">
        • Enter the ticket ID exactly as shown on the visitor&apos;s ticket{'\n'}
        • Make sure to check for any typos{'\n'}
        • The system will automatically process the ticket once submitted
      </Text>
    </View>
  )
} 