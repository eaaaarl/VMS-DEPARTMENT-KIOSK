import ActionButtons from '@/feature/developer/components/ActionButtons'
import ConfigDisplay from '@/feature/developer/components/ConfigDisplay'
import ServerConfigurationForm from '@/feature/developer/components/ServerConfigurationForm'
import { useDeveloperSettings } from '@/feature/developer/hooks/useDeveloperSettings'
import React from 'react'
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'

export default function DeveloperSettingsContainer() {
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
      <ScrollView className="flex-1 px-4 py-6">
        <ConfigDisplay currentConfig={{ ipAddress, port }} />

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
      </ScrollView>
    </KeyboardAvoidingView>
  )
}