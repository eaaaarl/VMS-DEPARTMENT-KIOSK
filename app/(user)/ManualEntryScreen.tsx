
import SignOutModal from '@/feature/user/components/SignOutModal'
import VisitorInformationModal from '@/feature/user/components/VisitorInformationModal'
import { ICreateVisitorLogDetailPayload, VisitorLog, VisitorLogDetail } from '@/feature/visitor/api/inteface'
import { useCreateVisitorLogDetailMutation, useLazyVisitorImageQuery, useLazyVisitorLogInDetailInfoQuery, useLazyVisitorLogInfoQuery, useUpdateVisitorsLogDetailMutation } from '@/feature/visitor/api/visitorApi'
import { formattedDateWithTime } from '@/feature/visitor/utils/formattedDate'
import { useAppSelector } from '@/lib/redux/hooks'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import Toast from 'react-native-toast-message'

export default function ManualEntryScreen() {
  const { departmentManualEntry } = useAppSelector((state) => state.departmentManualEntry)
  const [ticketId, setTicketId] = useState('')
  const [showVisitorInformationCheckingModal, setShowVisitorInformationCheckingModal] = useState(false)
  const [currentVisitorLog, setCurrentVisitorLog] = useState<VisitorLog | null>(null)
  const [currentVisitorLogInDetailSignOut, setCurrentVisitorLogInDetailSignOut] = useState<VisitorLogDetail | null>(null)
  const [purpose, setPurpose] = useState('')
  const [idVisitorImage, setIdVisitorImage] = useState<string | null>(null)
  const [photoVisitorImage, setPhotoVisitorImage] = useState<string | null>(null)
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { ipAddress, port } = useAppSelector((state) => state.config)

  const [visitorLogInfo] = useLazyVisitorLogInfoQuery();
  const [visitorLogInDetailInfo] = useLazyVisitorLogInDetailInfoQuery();
  const [visitorImage] = useLazyVisitorImageQuery();

  useEffect(() => {
    const checkingConfig = async () => {
      if (!ipAddress || ipAddress === '' || !port || port === 0) {
        router.replace('/(developer)/DeveloperSetting');
        return;
      }
    }

    checkingConfig()
  }, [ipAddress, port])

  const handleChangePurpose = (purpose: string) => {
    setPurpose(purpose)
  }

  const handleCloseVisitorInformationCheckingModal = () => {
    setShowVisitorInformationCheckingModal(false)
    setCurrentVisitorLog(null)
    setIdVisitorImage(null)
    setPhotoVisitorImage(null)
  }

  const [createVisitorLogDetail, { isLoading: isLoadingCreateVisitorLogDetail }] = useCreateVisitorLogDetailMutation();
  const [updateVisitorsLogDetail, { isLoading: isLoadingUpdateVisitorsLogDetail }] = useUpdateVisitorsLogDetailMutation();

  const handleSubmitVisitorLog = async () => {
    if (purpose.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Please enter a purpose of the visit!',
      })
      return
    }

    try {
      const payload: ICreateVisitorLogDetailPayload = {
        payload: {
          log: {
            id: currentVisitorLog?.id as number,
            strId: currentVisitorLog?.strId as string,
            logIn: formattedDateWithTime(new Date(currentVisitorLog?.logIn || '')),
            deptLogIn: formattedDateWithTime(new Date()),
            visitorId: currentVisitorLog?.visitorId as number,
            deptId: 0,
            reason: purpose,
            // null for no user
            userDeptLogInId: null
          }
        }
      }
      const response = await createVisitorLogDetail(payload).unwrap()
      Toast.show({
        type: 'success',
        text1: response.ghMessage.toUpperCase(),
      })
      handleCloseVisitorInformationCheckingModal()
      setTicketId('')
    } catch (error) {
      console.log(error)
    }
  }

  const handleSignOut = async () => {
    if (!currentVisitorLogInDetailSignOut?.strId || !currentVisitorLogInDetailSignOut?.strDeptLogIn) {
      Toast.show({
        type: 'error',
        text1: 'No visitor log in detail found!',
        text2: 'Please check the ticket id',
        position: 'bottom',
        bottomOffset: 100,
        visibilityTime: 4000,
      })
      return
    }

    try {
      const dateTimeDeptLogin = currentVisitorLogInDetailSignOut?.strDeptLogIn!
      const visitorStrId = currentVisitorLogInDetailSignOut?.strId

      const response = await updateVisitorsLogDetail({
        id: visitorStrId as string,
        dateTime: dateTimeDeptLogin || '',
        deptLogOut: formattedDateWithTime(new Date()),
        userDeptLogOutId: null,
      }).unwrap()

      if (response.ghError === 2001) {
        Toast.show({
          type: 'error',
          text1: 'Visitor Already Logged Out!',
          position: 'bottom',
          bottomOffset: 100,
          visibilityTime: 4000,
        })
        setShowSignOutModal(false)
        setTicketId('')
        return;
      }

      Toast.show({
        type: 'success',
        text1: response.ghMessage.toUpperCase(),
        position: 'bottom',
        bottomOffset: 100,
        visibilityTime: 3000,
      })

      setShowSignOutModal(false)
      setTicketId('')

    } catch (error) {
      console.log('Sign out error:', error)

      Toast.show({
        type: 'error',
        text1: 'Sign Out Failed',
        text2: 'Please try again or check your connection',
        position: 'bottom',
        bottomOffset: 100,
        visibilityTime: 4000,
      })
    }
  }

  const handleManualSubmit = async () => {
    if (ticketId.trim() === '') {
      Alert.alert('Error', 'Please enter a ticket ID')
      return
    }

    console.log(departmentManualEntry)
    console.log(ticketId)

    /* setIsSubmitting(true)
    try {
      const visitorLogInfoData = await visitorLogInfo({ strId: ticketId }).unwrap()
      const visitorLogInDetailData = await visitorLogInDetailInfo({ strId: ticketId }).unwrap()

      if (visitorLogInfoData?.results.length === 0) {
        Toast.show({
          type: 'error',
          text1: 'ID Not in use!',
          text2: 'Please check the ticket id'
        })
      } else if (visitorLogInfoData?.results?.[0].logOut !== null) {
        Toast.show({
          type: 'error',
          text1: 'ID Already Logged Out!',
        })
      } else if (visitorLogInfoData?.results?.[0].officeId === Number(departmentManualEntry?.officeId) && visitorLogInDetailData?.results?.length === 0) {
        setShowVisitorInformationCheckingModal(true)
        setCurrentVisitorLog(visitorLogInfoData?.results?.[0])
        const imageUrl = visitorLogInfoData?.results?.[0]?.strLogIn.replace(' ', '_').replace(':', '-').replace(':', '-') + '.png';
        const imageData = await visitorImage({ fileName: imageUrl }).unwrap()
        if (imageData.idExist && imageData.photoExist) {
          setIdVisitorImage(`id_${imageUrl}`)
          setPhotoVisitorImage(`face_${imageUrl}`)
        } else {
          setIdVisitorImage(null)
          setPhotoVisitorImage(null)
        }
      } else {
        setShowSignOutModal(true)
        setCurrentVisitorLogInDetailSignOut(visitorLogInDetailData?.results?.[0])
      }
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'Failed to process ticket')
    } finally {
      setIsSubmitting(false)
    } */
  }


  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
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
                />

                <TouchableOpacity
                  onPress={handleManualSubmit}
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

      {/* Visitor Information Modal */}
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

      {/* Sign Out Modal */}
      <SignOutModal
        visible={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleSignOut}
        ticketId={currentVisitorLogInDetailSignOut?.strId || ''}
        isLoading={isLoadingUpdateVisitorsLogDetail}
      />

    </SafeAreaView>
  )
} 