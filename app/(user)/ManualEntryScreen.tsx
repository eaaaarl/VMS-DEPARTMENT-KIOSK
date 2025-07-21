
import SignOutModal from '@/feature/user/components/SignOutModal'
import VisitorInformationModal from '@/feature/user/components/VisitorInformationModal'
import { ICreateVisitorLogDetailPayload, ICreateVisitorLogPayload, VisitorLog, VisitorLogDetail } from '@/feature/visitor/api/inteface'
import { useCreateVisitorLogDetailMutation, useCreateVisitorLogMutation, useLazyVisitorImageQuery, useLazyVisitorLogInDetailInfoQuery, useLazyVisitorLogInfoQuery, useUpdateVisitorLogMutation, useUpdateVisitorsLogDetailMutation } from '@/feature/visitor/api/visitorApi'
import { formattedDateWithTime } from '@/feature/visitor/utils/formattedDate'
import { useAppSelector } from '@/lib/redux/hooks'
import { Ionicons } from '@expo/vector-icons'
import { format, parse, subMinutes } from 'date-fns'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
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

export default function ManualEntryScreen() {
  // Redux State
  const { departmentManualEntry } = useAppSelector((state) => state.departmentManualEntry)
  const { ipAddress, port } = useAppSelector((state) => state.config)


  // State
  const [ticketId, setTicketId] = useState('')
  const [showVisitorInformationCheckingModal, setShowVisitorInformationCheckingModal] = useState(false)
  const [currentVisitorLog, setCurrentVisitorLog] = useState<VisitorLog | null>(null)
  const [currentVisitorLogInDetailSignOut, setCurrentVisitorLogInDetailSignOut] = useState<VisitorLogDetail | null>(null)
  const [purpose, setPurpose] = useState('')
  const [idVisitorImage, setIdVisitorImage] = useState<string | null>(null)
  const [photoVisitorImage, setPhotoVisitorImage] = useState<string | null>(null)
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState<string>('')

  const [visitorDetailSignInDifferentOffice, setVisitorDetailSignInDifferentOffice] = useState<VisitorLogDetail | null>(null)
  const [visitorLogSignInDifferentOffice, setVisitorLogSignInDifferentOffice] = useState<VisitorLog | null>(null)

  // RTK Query
  const [visitorLogInfo] = useLazyVisitorLogInfoQuery();
  const [visitorLogInDetailInfo] = useLazyVisitorLogInDetailInfoQuery();
  const [visitorImage] = useLazyVisitorImageQuery();

  // Effect
  useEffect(() => {
    const checkingConfig = async () => {
      if (!ipAddress || ipAddress === '' || !port || port === 0) {
        router.replace('/(developer)/DeveloperSetting');
        return;
      }
    }

    checkingConfig()
  }, [ipAddress, port])

  // Handlers
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
  const [updateVisitorLog, { isLoading: isLoadingUpdateVisitorLog }] = useUpdateVisitorLogMutation();
  const [createVisitorLog, { isLoading: isLoadingCreateVisitorLog }] = useCreateVisitorLogMutation();

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
            deptId: departmentManualEntry?.id as number,
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

    setIsSubmitting(true)
    try {
      const visitorLogInfoData = await visitorLogInfo({ strId: ticketId }).unwrap()
      const visitorLogInDetailData = await visitorLogInDetailInfo({ strId: ticketId }).unwrap()

      // Check if the ticket id is exist
      if (visitorLogInfoData?.results.length === 0) {
        Toast.show({
          type: 'error',
          text1: 'ID Not in use!',
          text2: 'Please check the ticket id'
        })

        return;
      }

      // Check if the ticket id is already logged out
      if (visitorLogInfoData?.results?.[0].logOut !== null) {
        Toast.show({
          type: 'error',
          text1: 'ID Already Logged Out!',
        })

        return;
      }

      // Check if the visitor is in the same office
      const sameOfficeVisitor = visitorLogInfoData?.results?.[0].officeId === Number(departmentManualEntry?.officeId)
      // Check if the visitor is not logged out
      const visitorNotLoggedOut = visitorLogInDetailData?.results?.length === 0 || visitorLogInDetailData?.results?.[0]?.deptLogOut !== null

      // Check if the visitor is in the same office and not logged out
      if (sameOfficeVisitor && visitorNotLoggedOut) {
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

        return;
      }

      const visitorInDifferentDepartment = visitorLogInDetailData?.results?.[0]?.deptId !== Number(departmentManualEntry?.id)
      const visitorIsHaveDeptLogIn = visitorLogInDetailData?.results?.length !== 0

      // Check if the visitor is in the different office, but same department
      // if (!sameOfficeVisitor && visitorIsHaveDeptLogIn && visitorInDifferentDepartment) {
      //   setShowModal(true)
      //   setModalMessage(`Visitor is not currently in the office premise,${'\n'}Do you want to automatically sign out${'\n'}their previous office location?`); return;
      // }

      const visitorISnotSameOfficeId = visitorLogInfoData?.results?.[0]?.officeId !== Number(departmentManualEntry?.officeId)
      console.log('visitorISnotSameOfficeId', visitorISnotSameOfficeId)
      if (visitorISnotSameOfficeId) {
        setShowModal(true)
        setModalMessage(`Visitor is not currently in the office premise of this department,${'\n'}Do you want to automatically sign out${'\n'}their previous office location?`);
        setVisitorDetailSignInDifferentOffice(visitorLogInDetailData?.results?.[0])
        setVisitorLogSignInDifferentOffice(visitorLogInfoData?.results?.[0])
        return;
      }

      console.log('Same Office Visitor:', sameOfficeVisitor)
      console.log('Visitor In Different Department:', visitorInDifferentDepartment)
      console.log('Visitor Is Have Dept Log In:', visitorIsHaveDeptLogIn)
      console.log('Visitor Not Logged Out:', visitorNotLoggedOut)

      // Sign out the visitor if the visitor is in the same office and department and not logged out
      setShowSignOutModal(true)
      setCurrentVisitorLogInDetailSignOut(visitorLogInDetailData?.results?.[0])
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'Failed to process ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleYes = async () => {
    console.log('visitorDetailSignInDifferentOffice', visitorDetailSignInDifferentOffice)
    console.log('visitorLogSignInDifferentOffice', visitorLogSignInDifferentOffice)
    try {
      if (visitorDetailSignInDifferentOffice) {
        if (visitorDetailSignInDifferentOffice.deptLogOut === null) {
          // const visitorStrId = visitorLogSignInDifferentOffice?.strId
          // const dateTimeDeptLogin = visitorDetailSignInDifferentOffice.strDeptLogIn
          // const now = new Date()
          // const oneMinuteAgo = subMinutes(now, 1)
          // const logOut = format(oneMinuteAgo, 'yyyy-MM-dd HH:mm:ss')


          // const response = await updateVisitorsLogDetail({
          //   id: visitorStrId as string,
          //   dateTime: dateTimeDeptLogin || '',
          //   sysDeptLogOut: true,
          //   deptLogOut: logOut,
          // }).unwrap()

          // console.log('response', response)

          // if (response.ghError === 2001) {
          //   Toast.show({
          //     type: 'error',
          //     text1: 'Visitor Already Logged Out!',
          //   })
          //   return;
          // }

          console.log('test')

        } else {
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


          const logDateStr = visitorLogSignInDifferentOffice?.logDate as string;
          const parsedDate = parse(logDateStr, 'MM/dd/yyyy', new Date());
          const formattedDate = format(parsedDate, 'yyyy-MM-dd');


          // Sign In Office 
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

          console.log('PayloadSignInOffice', PayloadSignInOffice)

          const response = await createVisitorLog(PayloadSignInOffice).unwrap()
          console.log('response', response)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }


  const handleCancel = () => {
    setShowModal(false)
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
                  keyboardType="numeric"
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


      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-lg">
            {/* Warning Icon */}
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center border-2 border-orange-200">
                <Text className="text-orange-500 text-2xl font-bold">!</Text>
              </View>
            </View>

            {/* Title */}
            <Text className="text-gray-800 text-xl font-semibold text-center mb-4">
              Visitor
            </Text>

            {/* Message */}
            <Text className="text-gray-600 text-base text-center leading-6 mb-8">
              {modalMessage}
            </Text>

            {/* Buttons */}
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