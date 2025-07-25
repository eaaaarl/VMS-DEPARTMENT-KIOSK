import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { View } from 'react-native'

interface ErrorIconProps {
  iconName: 'construct-outline' | 'time-outline' | 'wifi-outline' | 'warning-outline' | 'globe-outline'
}

export const ErrorIcon: React.FC<ErrorIconProps> = ({ iconName }) => {
  return (
    <View className='mb-8'>
      <View className='w-24 h-24 bg-red-100 rounded-full items-center justify-center mb-4'>
        <Ionicons name={iconName} size={48} color="#dc2626" />
      </View>
    </View>
  )
}