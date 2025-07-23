import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

interface ErrorActionsProps {
  primaryActionText: string
  onPrimaryAction: () => void
  onGoHome: () => void
}

export const ErrorActions: React.FC<ErrorActionsProps> = ({
  primaryActionText,
  onPrimaryAction,
  onGoHome
}) => {
  return (
    <View className='w-full max-w-sm gap-3'>
      {/* Primary Action Button */}
      <TouchableOpacity
        onPress={onPrimaryAction}
        className='bg-blue-600 py-4 px-6 rounded-lg shadow-sm'
        activeOpacity={0.8}
      >
        <Text className='text-white text-center font-semibold text-lg'>
          {primaryActionText}
        </Text>
      </TouchableOpacity>

      {/* Secondary Action Button */}
      <TouchableOpacity
        onPress={onGoHome}
        className='border border-gray-300 py-4 px-6 rounded-lg'
        activeOpacity={0.7}
      >
        <Text className='text-gray-700 text-center font-medium text-lg'>
          Go to Home
        </Text>
      </TouchableOpacity>
    </View>
  )
}