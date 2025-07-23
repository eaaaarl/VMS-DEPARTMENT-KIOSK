import React from 'react'
import { Text, View } from 'react-native'

interface ErrorContentProps {
  title: string
  message: string
}

export const ErrorContent: React.FC<ErrorContentProps> = ({ title, message }) => {
  return (
    <View className='items-center mb-12'>
      <Text className='text-2xl font-bold text-gray-800 mb-4 text-center'>
        {title}
      </Text>

      <Text className='text-base text-gray-600 text-center leading-6 max-w-sm'>
        {message}
      </Text>
    </View>
  )
}