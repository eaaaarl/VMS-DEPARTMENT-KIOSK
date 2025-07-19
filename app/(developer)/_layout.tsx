import { router, Stack } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

export default function LayoutDeveloper() {
  return (
    <Stack>
      <Stack.Screen
        name="DeveloperSetting"
        options={{
          headerShown: true,
          title: 'Developer Settings',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#f9fafb',
          },
          headerTitleStyle: {
            fontWeight: '600',
            color: '#111827',
            fontSize: 18,
          },
          headerLeft: () => null,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/(mode)/mode')}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: '#eff6ff',
                borderRadius: 8,
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{ color: '#2563eb', fontWeight: '500', fontSize: 16 }}
              >
                Done
              </Text>
            </TouchableOpacity>
          ),
          animationTypeForReplace: 'push',
          gestureEnabled: true,
        }}
      />
    </Stack>
  )
}