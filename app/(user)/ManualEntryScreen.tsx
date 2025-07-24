import { DifferentOfficeModal } from '@/feature/user/components/ManualEntry/DifferentOfficeModal'
import { Instructions } from '@/feature/user/components/ManualEntry/Instructions'
import { TicketInput } from '@/feature/user/components/ManualEntry/TicketInput'
import SignOutModal from '@/feature/user/components/SignOutModal'
import VisitorInformationModal from '@/feature/user/components/VisitorInformationModal'
import { useManualEntry } from '@/feature/user/hooks/useManualEntry'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React from 'react'
import { Keyboard, KeyboardAvoidingView, Platform, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ManualEntryScreen() {
  const {
    // State
    ticketId,
    purpose,
    isSubmitting,
    currentVisitorLog,
    currentVisitorLogInDetailSignOut,
    idVisitorImage,
    photoVisitorImage,
    showVisitorInformationCheckingModal,
    showSignOutModal,
    showModal,
    modalMessage,
    isLoadingCreateVisitorLogDetail,
    isLoadingUpdateVisitorsLogDetail,
    isLoadingUpdateVisitorLog,
    isLoadingCreateVisitorLog,
    isLoadingSignOutVisitor,
    isLoadingCreateDuplicatePhotoVisitor,

    // Actions
    setTicketId,
    handleChangePurpose,
    handleCloseVisitorInformationCheckingModal,
    handleSubmitVisitorLog,
    handleSignOut,
    handleTicketChecking,
    handleYesDifferentOffice,
    handleCancelDifferentOffice,
    setShowSignOutModal,
  } = useManualEntry()

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            {/* Header */}
            <View className="bg-white px-6 py-4 border-b border-gray-200">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="p-2"
                >
                  <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-gray-800">
                  Manual Entry
                </Text>
                <View className="w-10" />
              </View>
            </View>

            {/* Main Content */}
            <View className="flex-1 px-6 py-8">
              <TicketInput
                ticketId={ticketId}
                isSubmitting={isSubmitting}
                onChangeTicketId={setTicketId}
                onSubmit={handleTicketChecking}
              />

              <Instructions />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <VisitorInformationModal
        visible={showVisitorInformationCheckingModal}
        onClose={handleCloseVisitorInformationCheckingModal}
        currentVisitorLog={currentVisitorLog}
        idVisitorImage={idVisitorImage}
        photoVisitorImage={photoVisitorImage}
        purpose={purpose}
        handleChangePurpose={handleChangePurpose}
        onSubmitVisitorLog={handleSubmitVisitorLog}
        isLoading={
          isLoadingCreateVisitorLogDetail ||
          isLoadingCreateDuplicatePhotoVisitor ||
          isLoadingUpdateVisitorLog ||
          isLoadingCreateVisitorLog
        }
      />

      <SignOutModal
        visible={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleSignOut}
        ticketId={currentVisitorLogInDetailSignOut?.strId || ''}
        isLoading={isLoadingUpdateVisitorsLogDetail || isLoadingSignOutVisitor}
      />

      <DifferentOfficeModal
        visible={showModal}
        message={modalMessage}
        onConfirm={handleYesDifferentOffice}
        onCancel={handleCancelDifferentOffice}
      />
    </SafeAreaView>
  )
}