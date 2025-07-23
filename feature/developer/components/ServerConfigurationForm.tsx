import React from 'react'
import { Text, TextInput, View } from 'react-native'

interface ValidationErrors {
  ipAddress?: string
  port?: string
}

interface ServerConfigurationFormProps {
  ipAddress: string
  port: string
  errors: ValidationErrors
  onIpAddressChange: (value: string) => void
  onPortChange: (value: string) => void
}

export default function ServerConfigurationForm({
  ipAddress,
  port,
  errors,
  onIpAddressChange,
  onPortChange,
}: ServerConfigurationFormProps) {
  return (
    <View className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 mt-4">
      <Text className="text-xl font-semibold text-gray-900 mb-4">
        Server Configuration
      </Text>

      {/* IP Address Input */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          IP Address
        </Text>
        <TextInput
          value={ipAddress}
          onChangeText={onIpAddressChange}
          placeholder="Enter IP address (e.g., 192.168.1.100)"
          className={`w-full px-4 py-3 border rounded-lg bg-gray-50 text-base ${errors.ipAddress ? 'border-red-500' : 'border-gray-300'
            }`}
          keyboardType="numeric"
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={'gray'}
        />
        {errors.ipAddress && (
          <Text className="text-red-500 text-sm mt-1">{errors.ipAddress}</Text>
        )}
      </View>

      {/* Port Input */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Port
        </Text>
        <TextInput
          value={port}
          onChangeText={onPortChange}
          placeholder="Enter port (e.g., 3000)"
          className={`w-full px-4 py-3 border rounded-lg bg-gray-50 text-base ${errors.port ? 'border-red-500' : 'border-gray-300'
            }`}
          keyboardType="numeric"
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={'gray'}
        />
        {errors.port && (
          <Text className="text-red-500 text-sm mt-1">{errors.port}</Text>
        )}
      </View>
    </View>
  )
}