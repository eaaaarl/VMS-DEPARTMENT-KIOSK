import SignOutModal from '@/feature/user/components/SignOutModal'
import VisitorInformationModal from '@/feature/user/components/VisitorInformationModal'
import { ICreateVisitorLogDetailPayload, ICreateVisitorLogPayload, VisitorLog, VisitorLogDetail } from '@/feature/visitor/api/inteface'
import { useCreateVisitorLogDetailMutation, useCreateVisitorLogMutation, useLazyVisitorImageQuery, useLazyVisitorLogInDetailInfoQuery, useLazyVisitorLogInfoQuery, useUpdateVisitorLogMutation, useUpdateVisitorsLogDetailMutation } from '@/feature/visitor/api/visitorApi'
import { formattedDateWithTime } from '@/feature/visitor/utils/formattedDate'
import { useAppSelector } from '@/lib/redux/hooks'
import { Ionicons } from '@expo/vector-icons'
import { format, parse, subMinutes } from 'date-fns'
import { router } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

// Constants
const ERROR_CODES = {
  VISITOR_ALREADY_LOGGED_OUT: 2001,
} as const

const MODAL_MESSAGES = {
  DIFFERENT_OFFICE: `Visitor is not currently in the office premise of this department,\nDo you want to automatically sign out\ntheir previous office location?`,
} as const

export default function ManualEntryScreen() {
  // Redux State
  const { departmentManualEntry } = useAppSelector((state) => state.departmentManualEntry)
  const { ipAddress, port } = useAppSelector((state) => state.config)

  // Form State
  const [ticketId, setTicketId] = useState('')
  const [purpose, setPurpose] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Visitor State
  const [currentVisitorLog, setCurrentVisitorLog] = useState<VisitorLog | null>(null)
  const [currentVisitorLogInDetailSignOut, setCurrentVisitorLogInDetailSignOut] = useState<VisitorLogDetail | null>(null)
  const [idVisitorImage, setIdVisitorImage] = useState<string | null>(null)
  const [photoVisitorImage, setPhotoVisitorImage] = useState<string | null>(null)
  const [visitorDetailSignInDifferentOffice, setVisitorDetailSignInDifferentOffice] = useState<VisitorLogDetail | null>(null)
  const [visitorLogSignInDifferentOffice, setVisitorLogSignInDifferentOffice] = useState<VisitorLog | null>(null)

  // Modal State
  const [showVisitorInformationCheckingModal, setShowVisitorInformationCheckingModal] = useState(false)
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState<string>('')

  // RTK Query Hooks
  const [visitorLogInfo] = useLazyVisitorLogInfoQuery()
  const [visitorLogInDetailInfo] = useLazyVisitorLogInDetailInfoQuery()
  const [visitorImage] = useLazyVisitorImageQuery()
  const [createVisitorLogDetail, { isLoading: isLoadingCreateVisitorLogDetail }] = useCreateVisitorLogDetailMutation()
  const [updateVisitorsLogDetail, { isLoading: isLoadingUpdateVisitorsLogDetail }] = useUpdateVisitorsLogDetailMutation()
  const [updateVisitorLog, { isLoading: isLoadingUpdateVisitorLog }] = useUpdateVisitorLogMutation()
  const [createVisitorLog, { isLoading: isLoadingCreateVisitorLog }] = useCreateVisitorLogMutation()

  // Effects
  useEffect(() => {
    const checkingConfig = async () => {
      if (!ipAddress || ipAddress === '' || !port || port === 0) {
        router.replace('/(developer)/DeveloperSetting')
        return
      }
    }
    checkingConfig()
  }, [ipAddress, port])

  // Validation Functions
  const validateTicketId = useCallback((id: string): boolean => {
    if (id.trim() === '') {
      Alert.alert('Error', 'Please enter a ticket ID')
      return false
    }
    return true
  }, [])

  const validatePurpose = useCallback((purposeText: string): boolean => {
    if (purposeText.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Please enter a purpose of the visit!',
      })
      return false
    }
    return true
  }, [])

  // Utility Functions
  const showErrorToast = useCallback((title: string, subtitle?: string) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: subtitle,
      position: 'bottom',
      bottomOffset: 100,
      visibilityTime: 4000,
    })
  }, [])

  const showSuccessToast = useCallback((title: string) => {
    Toast.show({
      type: 'success',
      text1: title.toUpperCase(),
      position: 'bottom',
      bottomOffset: 100,
      visibilityTime: 3000,
    })
  }, [])

  const resetForm = useCallback(() => {
    setTicketId('')
    setPurpose('')
  }, [])

  const resetVisitorState = useCallback(() => {
    setCurrentVisitorLog(null)
    setCurrentVisitorLogInDetailSignOut(null)
    setIdVisitorImage(null)
    setPhotoVisitorImage(null)
    setVisitorDetailSignInDifferentOffice(null)
    setVisitorLogSignInDifferentOffice(null)
  }, [])

  // Image Fetching
  const fetchVisitorImages = useCallback(async (logInTime: string) => {
    try {
      const imageUrl = logInTime.replace(' ', '_').replace(/:/g, '-') + '.png'
      const imageData = await visitorImage({ fileName: imageUrl }).unwrap()

      if (imageData.idExist && imageData.photoExist) {
        setIdVisitorImage(`id_${imageUrl}`)
        setPhotoVisitorImage(`face_${imageUrl}`)
      } else {
        setIdVisitorImage(null)
        setPhotoVisitorImage(null)
      }
    } catch (error) {
      console.log('Error fetching images:', error)
      setIdVisitorImage(null)
      setPhotoVisitorImage(null)
    }
  }, [visitorImage])

  // Visitor Status Checking
  const checkVisitorExists = useCallback((visitorData: any) => {
    if (visitorData?.results.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'ID Not in use!',
        text2: 'Please check the ticket id'
      })
      return false
    }
    return true
  }, [])

  const checkVisitorLoggedOut = useCallback((visitorData: any) => {
    if (visitorData?.results?.[0].logOut !== null) {
      Toast.show({
        type: 'error',
        text1: 'ID Already Logged Out!',
      })
      return true
    }
    return false
  }, [])

  // Main Handlers
  const handleChangePurpose = useCallback((purposeText: string) => {
    setPurpose(purposeText)
  }, [])

  const handleCloseVisitorInformationCheckingModal = useCallback(() => {
    setShowVisitorInformationCheckingModal(false)
    resetVisitorState()
  }, [resetVisitorState])

  const handleSubmitVisitorLog = useCallback(async () => {
    if (!validatePurpose(purpose)) return

    try {
      const payload: ICreateVisitorLogDetailPayload = {
        payload: {
          log: {
            id: currentVisitorLog?.id as number,
            strId: currentVisitorLog?.strId as string,
            logIn: formattedDateWithTime(new Date(currentVisitorLog?.logIn || '')),
            deptLogIn: formattedDateWithTime(new Date()),
            visitorId: currentVisitorLog?.visitorId as number,
            deptId: departmentManualEntry?.id as number,
            reason: purpose,
            userDeptLogInId: null
          }
        }
      }

      const response = await createVisitorLogDetail(payload).unwrap()
      showSuccessToast(response.ghMessage)
      handleCloseVisitorInformationCheckingModal()
      resetForm()
    } catch (error) {
      console.log('Error submitting visitor log:', error)
      showErrorToast('Failed to submit visitor log')
    }
  }, [
    purpose,
    currentVisitorLog,
    departmentManualEntry,
    validatePurpose,
    createVisitorLogDetail,
    showSuccessToast,
    handleCloseVisitorInformationCheckingModal,
    resetForm,
    showErrorToast
  ])

  const handleSignOut = useCallback(async () => {
    if (!currentVisitorLogInDetailSignOut?.strId || !currentVisitorLogInDetailSignOut?.strDeptLogIn) {
      showErrorToast('No visitor log in detail found!', 'Please check the ticket id')
      return
    }

    try {
      const dateTimeDeptLogin = currentVisitorLogInDetailSignOut.strDeptLogIn
      const visitorStrId = currentVisitorLogInDetailSignOut.strId

      const response = await updateVisitorsLogDetail({
        id: visitorStrId,
        dateTime: dateTimeDeptLogin,
        deptLogOut: formattedDateWithTime(new Date()),
        userDeptLogOutId: null,
      }).unwrap()

      if (response.ghError === ERROR_CODES.VISITOR_ALREADY_LOGGED_OUT) {
        showErrorToast('Visitor Already Logged Out!')
        setShowSignOutModal(false)
        resetForm()
        return
      }

      showSuccessToast(response.ghMessage)
      setShowSignOutModal(false)
      resetForm()
    } catch (error) {
      console.log('Sign out error:', error)
      showErrorToast('Sign Out Failed', 'Please try again or check your connection')
    }
  }, [currentVisitorLogInDetailSignOut, updateVisitorsLogDetail, showErrorToast, showSuccessToast, resetForm])

  const handleSameOfficeVisitor = useCallback(async (visitorLogData: any) => {
    setShowVisitorInformationCheckingModal(true)
    setCurrentVisitorLog(visitorLogData.results[0])
    await fetchVisitorImages(visitorLogData.results[0].strLogIn)
  }, [fetchVisitorImages])

  const handleDifferentOfficeVisitor = useCallback((visitorLogData: any, visitorDetailData: any) => {
    setShowModal(true)
    setModalMessage(MODAL_MESSAGES.DIFFERENT_OFFICE)
    setVisitorDetailSignInDifferentOffice(visitorDetailData.results[0])
    setVisitorLogSignInDifferentOffice(visitorLogData.results[0])
  }, [])

  const handleSignOutVisitor = useCallback((visitorDetailData: any) => {
    setShowSignOutModal(true)
    setCurrentVisitorLogInDetailSignOut(visitorDetailData.results[0])
  }, [])


  const handleTicketChecking = useCallback(async () => {
    if (!validateTicketId(ticketId)) return

    setIsSubmitting(true)
    try {
      const visitorLogInfoData = await visitorLogInfo({ strId: ticketId }).unwrap()
      const visitorLogInDetailData = await visitorLogInDetailInfo({ strId: ticketId }).unwrap()

      // Validation checks
      if (!checkVisitorExists(visitorLogInfoData)) return
      if (checkVisitorLoggedOut(visitorLogInfoData)) return

      // Business logic
      const sameOfficeVisitor = visitorLogInfoData.results[0].officeId === Number(departmentManualEntry?.officeId)
      const visitorNotLoggedOut = visitorLogInDetailData?.results?.length === 0 || visitorLogInDetailData?.results?.[0]?.deptLogOut !== null

      // Handle different scenarios
      if (sameOfficeVisitor && visitorNotLoggedOut) {
        await handleSameOfficeVisitor(visitorLogInfoData)
        return
      }

      const visitorISnotSameOfficeId = visitorLogInfoData.results[0].officeId !== Number(departmentManualEntry?.officeId)
      if (visitorISnotSameOfficeId) {
        handleDifferentOfficeVisitor(visitorLogInfoData, visitorLogInDetailData)
        return
      }

      // Default case: sign out visitor
      handleSignOutVisitor(visitorLogInDetailData)
    } catch (error) {
      console.log('Error checking ticket:', error)
      Alert.alert('Error', 'Failed to process ticket')
    } finally {
      setIsSubmitting(false)
    }
  }, [
    ticketId,
    validateTicketId,
    visitorLogInfo,
    visitorLogInDetailInfo,
    checkVisitorExists,
    checkVisitorLoggedOut,
    departmentManualEntry,
    handleSameOfficeVisitor,
    handleDifferentOfficeVisitor,
    handleSignOutVisitor
  ])


  // Modal for Visitor that is sign in different office
  const handleYes = useCallback(async () => {
    try {
      // If visitor is Sign In the Department Office have now a Visitor log detail
      if (visitorDetailSignInDifferentOffice) {

        // Sign out from previous office
        if (visitorDetailSignInDifferentOffice.deptLogOut !== null) {
          const visitorStrId = visitorLogSignInDifferentOffice?.strId
          const dateTimeStrLogin = visitorLogSignInDifferentOffice?.strLogIn
          const payloadToSignOutOffice = {
            logOut: format(subMinutes(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            sysLogOut: true,
            returned: true,
          }

          await updateVisitorLog({
            id: visitorStrId as string,
            dateTime: dateTimeStrLogin || '',
            ...payloadToSignOutOffice
          }).unwrap()

          // Parse and format date
          const logDateStr = visitorLogSignInDifferentOffice?.logDate as string
          const parsedDate = parse(logDateStr, 'MM/dd/yyyy', new Date())
          const formattedDate = format(parsedDate, 'yyyy-MM-dd')

          // Sign in to new office
          const PayloadSignInOffice: ICreateVisitorLogPayload = {
            id: visitorLogSignInDifferentOffice?.id as number,
            strId: visitorLogSignInDifferentOffice?.strId as string,
            logIn: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            logInDate: formattedDate,
            visitorId: visitorLogSignInDifferentOffice?.visitorId as number,
            officeId: Number(departmentManualEntry?.officeId),
            serviceId: visitorLogSignInDifferentOffice?.serviceId as number,
            returned: false,
            specService: visitorLogSignInDifferentOffice?.specService as string ?? 'Test',
            userLogInId: 0,
          }

          await createVisitorLog(PayloadSignInOffice).unwrap()
          showSuccessToast('Visitor transferred successfully')
          setShowModal(false)
          resetForm()
        }
      }
    } catch (error) {
      console.log('Error handling different office visitor:', error)
      showErrorToast('Failed to transfer visitor')
    }
  }, [
    visitorDetailSignInDifferentOffice,
    visitorLogSignInDifferentOffice,
    updateVisitorLog,
    createVisitorLog,
    departmentManualEntry,
    showSuccessToast,
    showErrorToast,
    resetForm
  ])

  const handleCancel = useCallback(() => {
    setShowModal(false)
  }, [])

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
              <View className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <Text className="text-xl font-bold text-gray-800 mb-2">
                  Enter Ticket ID
                </Text>
                <Text className="text-gray-600 mb-6">
                  Please enter the visitor&apos;s ticket ID manually
                </Text>

                <TextInput
                  value={ticketId}
                  onChangeText={setTicketId}
                  placeholder="Enter ticket ID"
                  className="border border-gray-300 rounded-lg px-4 py-4 mb-6 text-gray-800 text-lg"
                  placeholderTextColor="#9CA3AF"
                  autoFocus={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="numeric"
                />

                <TouchableOpacity
                  onPress={handleTicketChecking}
                  className={`rounded-lg py-4 ${ticketId.trim() && !isSubmitting ? 'bg-blue-600' : 'bg-gray-400'}`}
                  disabled={!ticketId.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <View className="flex-row items-center justify-center">
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text className="text-white text-center font-semibold ml-2">
                        Processing...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-white text-center font-semibold text-lg">
                      Submit
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Instructions */}
              <View className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <Text className="text-blue-800 font-semibold mb-2">
                  Instructions:
                </Text>
                <Text className="text-blue-700 text-sm">
                  • Enter the ticket ID exactly as shown on the visitor&apos;s ticket{'\n'}
                  • Make sure to check for any typos{'\n'}
                  • The system will automatically process the ticket once submitted
                </Text>
              </View>
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
        isLoading={isLoadingCreateVisitorLogDetail}
      />

      <SignOutModal
        visible={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleSignOut}
        ticketId={currentVisitorLogInDetailSignOut?.strId || ''}
        isLoading={isLoadingUpdateVisitorsLogDetail}
      />

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-lg">
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center border-2 border-orange-200">
                <Text className="text-orange-500 text-2xl font-bold">!</Text>
              </View>
            </View>

            <Text className="text-gray-800 text-xl font-semibold text-center mb-4">
              Visitor
            </Text>

            <Text className="text-gray-600 text-base text-center leading-6 mb-8">
              {modalMessage}
            </Text>

            <View className="flex-row gap-4">
              <TouchableOpacity
                className="flex-1 bg-blue-500 py-3 rounded-lg"
                onPress={handleYes}
              >
                <Text className="text-white text-center font-medium text-base">
                  Yes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-red-500 py-3 rounded-lg"
                onPress={handleCancel}
              >
                <Text className="text-white text-center font-medium text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}