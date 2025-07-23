import React from 'react'
import { Text, View } from 'react-native'

export const ErrorFooter: React.FC = () => {
  return (
    <View className='mt-8 items-center'>
      <Text className='text-sm text-gray-500 text-center'>
        If the problem persists, please contact support
      </Text>
    </View>
  )
}