import React from 'react';
import { Text, View } from 'react-native';

interface ConfigDisplayProps {
  currentConfig: {
    ipAddress: string;
    port: string;
  };
  className?: string;
}

export default function ConfigDisplay({ currentConfig, className = '' }: ConfigDisplayProps) {
  const { ipAddress, port } = currentConfig;
  const isConfigured = ipAddress && port;

  return (
    <View className={`rounded-lg border p-4 ${isConfigured ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'} ${className}`}>
      <View className="flex-row items-center mb-2">
        <View className={`mr-2 h-2 w-2 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-gray-400'}`} />
        <Text className={`text-sm font-medium ${isConfigured ? 'text-green-800' : 'text-gray-600'}`}>
          {isConfigured ? 'Configuration Active' : 'No Configuration'}
        </Text>
      </View>

      {isConfigured ? (
        <View>
          <Text className="text-xs text-green-700 mb-1">Current API Endpoint:</Text>
          <Text className="text-sm font-mono text-green-800">
            http://{ipAddress}:{port}
          </Text>
        </View>
      ) : (
        <Text className="text-xs text-gray-500">
          Configure your API settings below to establish connection
        </Text>
      )}
    </View>
  );
} 