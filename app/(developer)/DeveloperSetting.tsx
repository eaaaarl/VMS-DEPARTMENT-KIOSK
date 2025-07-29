import ActionButtons from '@/feature/developer/components/ActionButtons'
import ConfigDisplay from '@/feature/developer/components/ConfigDisplay'
import ServerConfigurationForm from '@/feature/developer/components/ServerConfigurationForm'
import { useDeveloperSettings } from '@/feature/developer/hooks/useDeveloperSettings'
import React from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, View } from 'react-native'

export default function DeveloperSettingsContainer() {
  const { width, height } = useWindowDimensions()
  const isLandscape = width > height
  
  const {
    ipAddress,
    port,
    errors,
    loading,
    setIpAddress,
    setPort,
    handleSave,
    handleReset,
  } = useDeveloperSettings()

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      className="flex-1 bg-gray-50"
    >
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: isLandscape ? 32 : 16,
          paddingVertical: isLandscape ? 16 : 24,
        }}
      >
        <View style={{ 
          flexDirection: isLandscape ? 'row' : 'column',
          gap: isLandscape ? 24 : 0
        }}>
          {/* Left side - Config Display */}
          <View style={{ flex: isLandscape ? 1 : undefined }}>
            <ConfigDisplay currentConfig={{ ipAddress, port }} />
          </View>

          {/* Right side - Form and Buttons */}
          <View style={{ flex: isLandscape ? 1 : undefined }}>
            <ServerConfigurationForm
              ipAddress={ipAddress}
              port={port}
              errors={errors}
              onIpAddressChange={setIpAddress}
              onPortChange={setPort}
            />

            <ActionButtons
              loading={loading}
              onSave={handleSave}
              onReset={handleReset}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}