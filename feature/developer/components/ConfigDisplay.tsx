import React from 'react';
import { Text, View, useWindowDimensions } from 'react-native';

interface ConfigDisplayProps {
  currentConfig: {
    ipAddress: string;
    port: string;
  };
  className?: string;
}

export default function ConfigDisplay({ currentConfig, className = '' }: ConfigDisplayProps) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { ipAddress, port } = currentConfig;
  const isConfigured = ipAddress && port;

  return (
    <View 
      className={`rounded-lg border p-4 ${isConfigured ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'} ${className}`}
      style={{
        padding: isLandscape ? 20 : 16,
        marginBottom: isLandscape ? 0 : 16,
      }}
    >
      <View className="flex-row items-center mb-2">
        <View className={`mr-2 h-2 w-2 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-gray-400'}`} />
        <Text 
          className={`font-medium ${isConfigured ? 'text-green-800' : 'text-gray-600'}`}
          style={{ fontSize: isLandscape ? 16 : 14 }}
        >
          {isConfigured ? 'Configuration Active' : 'No Configuration'}
        </Text>
      </View>

      {isConfigured ? (
        <View>
          <Text 
            className="text-green-700 mb-1"
            style={{ fontSize: isLandscape ? 14 : 12 }}
          >
            Current API Endpoint:
          </Text>
          <Text 
            className="font-mono text-green-800"
            style={{ fontSize: isLandscape ? 16 : 14 }}
          >
            http://{ipAddress}:{port}
          </Text>
        </View>
      ) : (
        <Text 
          className="text-gray-500"
          style={{ fontSize: isLandscape ? 14 : 12 }}
        >
          Configure your API settings below to establish connection
        </Text>
      )}
    </View>
  );
} 