import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Animated, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ErrorScreen({ route }: { route: { params: { errorType: string, retryAction: () => void } } }) {
  const [fadeAnim] = useState(new Animated.Value(0))
  const [pulseAnim] = useState(new Animated.Value(1))

  // Get error type from route params, default to 'connection'
  const errorType = route?.params?.errorType || 'connection'
  const retryAction = route?.params?.retryAction

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    // Pulse animation for icon
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    )
    pulseLoop.start()

    return () => pulseLoop.stop()
  }, [fadeAnim, pulseAnim])

  const getErrorConfig = () => {
    switch (errorType) {
      case 'server':
        return {
          icon: '🔧',
          title: 'Server Error',
          message: 'Our servers are experiencing issues. Please try again in a few moments.',
          actionText: 'Retry'
        }
      case 'timeout':
        return {
          icon: '⏰',
          title: 'Request Timeout',
          message: 'The request took too long to complete. Please check your connection and try again.',
          actionText: 'Try Again'
        }
      case 'network':
        return {
          icon: '📡',
          title: 'Network Error',
          message: 'Unable to connect to our servers. Please check your internet connection.',
          actionText: 'Retry'
        }
      case 'api':
        return {
          icon: '⚠️',
          title: 'API Error',
          message: 'Something went wrong with the service. Our team has been notified.',
          actionText: 'Try Again'
        }
      default: // connection
        return {
          icon: '🌐',
          title: 'Connection Problem',
          message: 'Unable to connect to the internet. Please check your network settings and try again.',
          actionText: 'Retry Connection'
        }
    }
  }

  const errorConfig = getErrorConfig()

  const handleRetry = () => {
    if (retryAction && typeof retryAction === 'function') {
      retryAction()
    } else {
      // Default behavior: go back or refresh
      if (router.canGoBack()) {
        router.back()
      } else {
        router.replace('/')
      }
    }
  }

  const handleGoHome = () => {
    router.replace('/')
  }

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <Animated.View
        style={{ opacity: fadeAnim }}
        className='flex-1 items-center justify-center px-6'
      >
        {/* Error Icon */}
        <Animated.View
          style={{ transform: [{ scale: pulseAnim }] }}
          className='mb-8'
        >
          <View className='w-24 h-24 bg-red-100 rounded-full items-center justify-center mb-4'>
            <Text className='text-4xl'>{errorConfig.icon}</Text>
          </View>
        </Animated.View>

        {/* Error Content */}
        <View className='items-center mb-12'>
          <Text className='text-2xl font-bold text-gray-800 mb-4 text-center'>
            {errorConfig.title}
          </Text>

          <Text className='text-base text-gray-600 text-center leading-6 max-w-sm'>
            {errorConfig.message}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className='w-full max-w-sm gap-3'>
          {/* Primary Action Button */}
          <TouchableOpacity
            onPress={handleRetry}
            className='bg-blue-600 py-4 px-6 rounded-lg shadow-sm'
            activeOpacity={0.8}
          >
            <Text className='text-white text-center font-semibold text-lg'>
              {errorConfig.actionText}
            </Text>
          </TouchableOpacity>

          {/* Secondary Action Button */}
          <TouchableOpacity
            onPress={handleGoHome}
            className='border border-gray-300 py-4 px-6 rounded-lg'
            activeOpacity={0.7}
          >
            <Text className='text-gray-700 text-center font-medium text-lg'>
              Go to Home
            </Text>
          </TouchableOpacity>
        </View>

        {/* Additional Help Text */}
        <View className='mt-8 items-center'>
          <Text className='text-sm text-gray-500 text-center'>
            If the problem persists, please contact support
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  )
}