import ConfigDisplay from '@/feature/developer/ConfigDisplay'
import { useAppDispatch } from '@/lib/redux/hooks'
import { setConfig } from '@/lib/redux/state/configSlice'
import React, { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function DeveloperSetting() {
  const dispatch = useAppDispatch()
  const [ipAddress, setIpAddress] = useState('')
  const [port, setPort] = useState('')
  const [errors, setErrors] = useState<{ ipAddress?: string, port?: string }>({})

  const validateIP = (ip: string) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return ipRegex.test(ip) || ip === 'localhost'
  }

  const validatePort = (port: string) => {
    const portNum = parseInt(port)
    return portNum >= 1 && portNum <= 65535
  }

  const handleSave = () => {
    const newErrors: { ipAddress?: string, port?: string } = {}

    if (!ipAddress.trim()) {
      newErrors.ipAddress = 'IP address is required'
    } else if (!validateIP(ipAddress.trim())) {
      newErrors.ipAddress = 'Please enter a valid IP address'
    }

    if (!port.trim()) {
      newErrors.port = 'Port is required'
    } else if (!validatePort(port.trim())) {
      newErrors.port = 'Port must be between 1 and 65535'
    }

    setErrors(newErrors)

    try {
      dispatch(setConfig({ ipAddress: ipAddress, port: parseInt(port) }))
    } catch (error) {
      console.log(error)
    }
  }

  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setIpAddress('')
            setPort('')
            setErrors({})
          }
        }
      ]
    )
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <ScrollView className="flex-1 px-4 py-6">
        <ConfigDisplay currentConfig={{ ipAddress, port }} />

        {/* Server Configuration Card */}
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
              onChangeText={setIpAddress}
              placeholder="Enter IP address (e.g., 192.168.1.100)"
              className={`w-full px-4 py-3 border rounded-lg bg-gray-50 text-base ${errors.ipAddress ? 'border-red-500' : 'border-gray-300'
                }`}
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
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
              onChangeText={setPort}
              placeholder="Enter port (e.g., 3000)"
              className={`w-full px-4 py-3 border rounded-lg bg-gray-50 text-base ${errors.port ? 'border-red-500' : 'border-gray-300'
                }`}
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.port && (
              <Text className="text-red-500 text-sm mt-1">{errors.port}</Text>
            )}
          </View>


        </View>



        {/* Action Buttons */}
        <View className="flex-row gap-4 mb-8">
          <TouchableOpacity
            onPress={handleSave}
            className="flex-1 bg-blue-600 rounded-lg py-4 items-center shadow-sm"
          >
            <Text className="text-white font-semibold text-base">
              Save Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleReset}
            className="flex-1 bg-gray-200 rounded-lg py-4 items-center"
          >
            <Text className="text-gray-700 font-semibold text-base">
              Reset
            </Text>
          </TouchableOpacity>
        </View>


      </ScrollView>
    </KeyboardAvoidingView>
  )
}