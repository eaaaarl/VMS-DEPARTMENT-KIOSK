import React from 'react'
import { Text, TextInput, View, useWindowDimensions } from 'react-native'

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
  const { width, height } = useWindowDimensions()
  const isLandscape = width > height

  return (
    <View 
      className="bg-white rounded-xl shadow-sm border border-gray-200"
      style={{
        padding: isLandscape ? 24 : 24,
        marginBottom: isLandscape ? 16 : 24,
        marginTop: isLandscape ? 0 : 16,
      }}
    >
      <Text 
        className="font-semibold text-gray-900 mb-4"
        style={{ fontSize: isLandscape ? 24 : 20 }}
      >
        Server Configuration
      </Text>

      {/* IP Address Input */}
      <View className="mb-4">
        <Text 
          className="font-medium text-gray-700 mb-2"
          style={{ fontSize: isLandscape ? 16 : 14 }}
        >
          IP Address
        </Text>
        <TextInput
          value={ipAddress}
          onChangeText={onIpAddressChange}
          placeholder="Enter IP address (e.g., 192.168.1.100)"
          className={`w-full px-4 py-3 border rounded-lg bg-gray-50 text-base ${errors.ipAddress ? 'border-red-500' : 'border-gray-300'
            }`}
          style={{
            fontSize: isLandscape ? 16 : 14,
            paddingVertical: isLandscape ? 16 : 12,
          }}
          keyboardType="numeric"
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={'gray'}
        />
        {errors.ipAddress && (
          <Text 
            className="text-red-500 mt-1"
            style={{ fontSize: isLandscape ? 14 : 12 }}
          >
            {errors.ipAddress}
          </Text>
        )}
      </View>

      {/* Port Input */}
      <View className="mb-4">
        <Text 
          className="font-medium text-gray-700 mb-2"
          style={{ fontSize: isLandscape ? 16 : 14 }}
        >
          Port
        </Text>
        <TextInput
          value={port}
          onChangeText={onPortChange}
          placeholder="Enter port (e.g., 3000)"
          className={`w-full px-4 py-3 border rounded-lg bg-gray-50 text-base ${errors.port ? 'border-red-500' : 'border-gray-300'
            }`}
          style={{
            fontSize: isLandscape ? 16 : 14,
            paddingVertical: isLandscape ? 16 : 12,
          }}
          keyboardType="numeric"
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={'gray'}
        />
        {errors.port && (
          <Text 
            className="text-red-500 mt-1"
            style={{ fontSize: isLandscape ? 14 : 12 }}
          >
            {errors.port}
          </Text>
        )}
      </View>
    </View>
  )
}