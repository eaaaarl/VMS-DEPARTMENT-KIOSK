import { ErrorScreenParams, useErrorScreen } from '@/feature/error'
import { ErrorActions } from '@/feature/error/components/ErrorActions'
import { ErrorContent } from '@/feature/error/components/ErrorContent'
import { ErrorFooter } from '@/feature/error/components/ErrorFooter'
import { ErrorIcon } from '@/feature/error/components/ErrorIcon'
import React from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'


interface ErrorScreenProps {
  route?: {
    params?: ErrorScreenParams
  }
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ route }) => {
  const { errorConfig, handleRetry, handleGoHome } = useErrorScreen(route?.params)

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <View className='flex-1 items-center justify-center px-6'>
        <ErrorIcon iconName={errorConfig.icon} />
        <ErrorContent title={errorConfig.title} message={errorConfig.message} />
        <ErrorActions
          primaryActionText={errorConfig.actionText}
          onPrimaryAction={handleRetry}
          onGoHome={handleGoHome}
        />
        <ErrorFooter />
      </View>
    </SafeAreaView>
  )
}