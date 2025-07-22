import SignOutModal from '@/feature/user/components/SignOutModal'
import VisitorInformationModal from '@/feature/user/components/VisitorInformationModal'
import { ICreateVisitorLogDetailPayload, ICreateVisitorLogPayload, IVisitorSignOutPayload, VisitorLog, VisitorLogDetail } from '@/feature/visitor/api/inteface'
import { useCreateVisitorLogDetailMutation, useCreateVisitorLogDuplicatePhotoMutation, useCreateVisitorLogMutation, useLazyVisitorImageQuery, useLazyVisitorLogInDetailInfoQuery, useLazyVisitorLogInfoQuery, useSignOutVisitorLogDetailMutation, useUpdateVisitorLogMutation, useUpdateVisitorsLogDetailMutation } from '@/feature/visitor/api/visitorApi'
import { useAppSelector } from '@/lib/redux/hooks'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { format, parse, subMinutes } from 'date-fns'
import { BarcodeScanningResult, Camera, CameraView } from 'expo-camera'
import { router } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

// QR Overlay Component
const QRCodeOverlay = ({ scanned }: { scanned: boolean }) => {
  // Size of the scanning frame
  const frameSize = 250

  return (
    <View className="absolute inset-0 justify-center items-center">


      {/* Scanning frame with corner borders only */}
      <View style={{
        width: frameSize,
        height: frameSize,
        position: 'relative',
        borderRadius: 24,
      }}>
        {/* Corner indicators - Google Lens style */}
        {/* Top Left */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 40,
          height: 40,
          borderTopWidth: 4,
          borderLeftWidth: 4,
          borderColor: '#4CAF50',
          borderTopLeftRadius: 16,
        }} />

        {/* Top Right */}
        <View style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 40,
          height: 40,
          borderTopWidth: 4,
          borderRightWidth: 4,
          borderColor: '#4285F4',
          borderTopRightRadius: 16,
        }} />

        {/* Bottom Left */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 40,
          height: 40,
          borderBottomWidth: 4,
          borderLeftWidth: 4,
          borderColor: '#FBBC05',
          borderBottomLeftRadius: 16,
        }} />

        {/* Bottom Right */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 40,
          height: 40,
          borderBottomWidth: 4,
          borderRightWidth: 4,
          borderColor: '#EA4335',
          borderBottomRightRadius: 16,
        }} />

        {/* Center focus point when scanned */}
        {scanned && (
          <View style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 24,
            height: 24,
            marginLeft: -12,
            marginTop: -12,
            borderRadius: 12,
            backgroundColor: 'rgba(76, 175, 80, 0.3)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: '#4CAF50',
            }} />
          </View>
        )}
      </View>

      {/* Instructions */}
      <View style={{
        position: 'absolute',
        bottom: 120,
        left: 20,
        right: 20,
        alignItems: 'center',
      }}>
        <View style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          paddingHorizontal: 24,
          paddingVertical: 14,
          borderRadius: 24,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          {scanned ? (
            <ActivityIndicator size="small" color="#4CAF50" style={{ marginRight: 10 }} />
          ) : (
            <Ionicons name="qr-code" size={20} color="#4CAF50" style={{ marginRight: 10 }} />
          )}
          <Text style={{
            color: 'white',
            fontSize: 16,
            fontWeight: '500',
            textAlign: 'center',
          }}>
            {scanned ? 'Processing QR code...' : 'Position QR code within the frame'}
          </Text>
        </View>
      </View>
    </View>
  )
}

const MODAL_MESSAGES = {
  DIFFERENT_OFFICE: `Visitor is not currently in the office premise of this department,\nDo you want to automatically sign out\ntheir previous office location?`,
} as const

export default function CameraScreen() {
  //Redux State
  const { departmentCameraEntry } = useAppSelector((state) => state.departmentCameraEntry)
  const { ipAddress, port } = useAppSelector((state) => state.config)

  //Ui State
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [showVisitorInformationCheckingModal, setShowVisitorInformationCheckingModal] = useState(false)
  const [currentVisitorLog, setCurrentVisitorLog] = useState<VisitorLog | null>(null)
  const [currentVisitorLogInDetailSignOut, setCurrentVisitorLogInDetailSignOut] = useState<VisitorLogDetail | null>(null)
  const [purpose, setPurpose] = useState('')
  const [idVisitorImage, setIdVisitorImage] = useState<string | null>(null)
  const [photoVisitorImage, setPhotoVisitorImage] = useState<string | null>(null)
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState<string>('')
  const [visitorDetailSignInDifferentOffice, setVisitorDetailSignInDifferentOffice] = useState<VisitorLogDetail | null>(null);
  const [visitorLogSignInDifferentOffice, setVisitorLogSignInDifferentOffice] = useState<VisitorLog | null>(null)


  // RTK Query Hooks
  const [visitorLogInfo] = useLazyVisitorLogInfoQuery()
  const [visitorLogInDetailInfo] = useLazyVisitorLogInDetailInfoQuery()
  const [visitorImage] = useLazyVisitorImageQuery()
  const [createVisitorLogDetail, { isLoading: isLoadingCreateVisitorLogDetail }] = useCreateVisitorLogDetailMutation()
  const [updateVisitorsLogDetail, { isLoading: isLoadingUpdateVisitorsLogDetail }] = useUpdateVisitorsLogDetailMutation()
  const [updateVisitorLog, { isLoading: isLoadingUpdateVisitorLog }] = useUpdateVisitorLogMutation()
  const [createVisitorLog, { isLoading: isLoadingCreateVisitorLog }] = useCreateVisitorLogMutation()
  const [signOutVisitor, { isLoading: isLoadingSignOutVisitor }] = useSignOutVisitorLogDetailMutation()
  const [createDuplicatePhotoVisitor, { isLoading: isLoadingCreateDuplicatePhotoVisitor }] = useCreateVisitorLogDuplicatePhotoMutation()

  const navigation = useNavigation();

  useEffect(() => {
    const checkingConfig = async () => {
      if (!ipAddress || ipAddress === '' || !port || port === 0) {
        router.replace('/(developer)/DeveloperSetting');
        return;
      }
    }
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === 'granted')
      return;
    }
    getCameraPermissions()
    checkingConfig()

    // Handle navigation focus/blur events to manage camera state
    const unsubscribeFocus = navigation.addListener('focus', () => {
      setCameraEnabled(true);
    });

    const unsubscribeBlur = navigation.addListener('blur', () => {
      setCameraEnabled(false);
    });

    // Cleanup function to disable camera when component unmounts
    return () => {
      setCameraEnabled(false);
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [ipAddress, port, navigation])

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

  const handleChangePurpose = (purpose: string) => {
    setPurpose(purpose)
  }

  const handleCloseVisitorInformationCheckingModal = () => {
    setShowVisitorInformationCheckingModal(false)
    setCurrentVisitorLog(null)
    setIdVisitorImage(null)
    setPhotoVisitorImage(null)
    setPurpose('')
    setScanned(false)
  }

  const checkVisitorData = useCallback((visitorData: any) => {
    if (visitorData?.results?.length === 0) {
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
    if (visitorData?.results?.[0]?.logOut !== null) {
      Toast.show({
        type: 'error',
        text1: 'ID Already Logged Out!',
      })
      return true
    }
    return false
  }, [])

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

  const handleSignOutVisitor = useCallback((visitorDetailData: any) => {
    setShowSignOutModal(true)
    setCurrentVisitorLogInDetailSignOut(visitorDetailData.results[0])
  }, [])

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

  const handleBarCodeScanned = async (scanner: BarcodeScanningResult) => {
    if (scanned) return
    setScanned(true)
    try {
      const scannedTicket = scanner?.data
      const { data: visitorLog } = await visitorLogInfo({ strId: scannedTicket as string })
      const { data: visitorLogDetail } = await visitorLogInDetailInfo({ strId: scannedTicket as string })

      if (!checkVisitorData(visitorLog)) return
      if (checkVisitorLoggedOut(visitorLog)) return

      const sameOfficeVisitor = visitorLog?.results[0].officeId === Number(departmentCameraEntry?.officeId)
      const visitorNotLoggedOut = visitorLogDetail?.results?.length === 0 || visitorLogDetail?.results?.[0]?.deptLogOut !== null

      if (sameOfficeVisitor && visitorNotLoggedOut) {
        // Vistor is same office and not logged out
        await handleSameOfficeVisitor(visitorLog)
        return
      }

      const visitorISnotSameOfficeId = visitorLog?.results[0].officeId !== Number(departmentCameraEntry?.officeId)
      if (visitorISnotSameOfficeId) {
        handleDifferentOfficeVisitor(visitorLog, visitorLogDetail)
        return
      }

      handleSignOutVisitor(visitorLogDetail)
    } catch (error) {
      console.log('Error checking ticket:', error)
      Alert.alert('Error', 'Failed to process ticket')
    } finally {
      setScanned(false)
    }
  }


  const handleSubmitVisitorLog = async () => {
    if (!validatePurpose(purpose)) return

    try {
      const payload: ICreateVisitorLogDetailPayload = {
        payload: {
          log: {
            id: currentVisitorLog?.id as number,
            strId: currentVisitorLog?.strId as string,
            logIn: format(new Date(currentVisitorLog?.logIn || ''), 'yyyy-MM-dd HH:mm:ss'),
            deptLogIn: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            visitorId: currentVisitorLog?.visitorId as number,
            deptId: departmentCameraEntry?.id as number,
            reason: purpose,
            userDeptLogInId: null
          }
        }
      }

      const response = await createVisitorLogDetail(payload).unwrap()
      Toast.show({
        type: 'success',
        text1: response.ghMessage.toUpperCase(),
        position: 'bottom',
        bottomOffset: 100,
        visibilityTime: 3000,
      })
      handleCloseVisitorInformationCheckingModal()
      setPurpose('')
    } catch (error) {
      console.log('Error submitting visitor log:', error)
      Toast.show({
        type: 'error',
        text1: 'Failed to submit visitor log',
        position: 'bottom',
        bottomOffset: 100,
        visibilityTime: 4000,
      })
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
      const dateTimeDeptLogin = currentVisitorLogInDetailSignOut.strDeptLogIn
      const visitorStrId = currentVisitorLogInDetailSignOut.strId

      const response = await updateVisitorsLogDetail({
        id: visitorStrId,
        dateTime: dateTimeDeptLogin,
        deptLogOut: format(subMinutes(new Date(), 2), 'yyyy-MM-dd HH:mm:ss'),
        userDeptLogOutId: null,
      }).unwrap()

      Toast.show({
        type: 'success',
        text1: response.ghMessage.toUpperCase(),
        position: 'bottom',
        bottomOffset: 100,
        visibilityTime: 3000,
      })
      setShowSignOutModal(false)
      setPurpose('')
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


  const resetForm = useCallback(() => {
    setPurpose('')
  }, [])

  const handleDifferentOfficeVisitorLog = useCallback(async (visitorLogData: VisitorLog) => {
    setShowVisitorInformationCheckingModal(true)
    setCurrentVisitorLog(visitorLogData)
    await fetchVisitorImages(visitorLogData.strLogIn)
  }, [fetchVisitorImages])

  // Modal for Visitor that is sign in different office
  const HandleYesDifferentOffice = useCallback(async () => {
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
            officeId: Number(departmentCameraEntry?.officeId),
            serviceId: visitorLogSignInDifferentOffice?.serviceId as number,
            returned: false,
            specService: visitorLogSignInDifferentOffice?.specService as string ?? '',
            userLogInId: 0,
          }

          const newfileName = PayloadSignInOffice.logIn.replace(' ', '_').replace(':', "-") + '.png';
          const fileName = format(visitorLogSignInDifferentOffice?.strLogIn as string, 'yyyy-MM-dd HH:mm:ss').replace(" ", "_").replace(":", "-") + '.png';
          await createDuplicatePhotoVisitor({ filename: fileName, newFilename: newfileName })

          const response = await createVisitorLog(PayloadSignInOffice).unwrap()
          // showSuccessToast('Visitor transferred successfully')
          if (response.ghMessage) {
            setShowModal(false)
            resetForm()
          }

          handleDifferentOfficeVisitorLog(visitorLogSignInDifferentOffice as VisitorLog)
          console.log('This will trigger because the visitor is sign out in the previous office, but the visitor will sign in different office')
          return;
        }

        // visitorDetailSignInDifferentOffice.deptLogOut === null
        // If the Visitor Is Sign in in the Office in previous office it is not sign out

        console.log('This is will trigger because the visitor is not sign out in the previous office, but the visitor will sign different office')
        const dateTimeDeptLogin = visitorDetailSignInDifferentOffice.strDeptLogIn
        const visitorStrId = visitorDetailSignInDifferentOffice.strId

        await updateVisitorsLogDetail({
          id: visitorStrId,
          dateTime: dateTimeDeptLogin,
          deptLogOut: format(subMinutes(new Date(), 2), 'yyyy-MM-dd HH:mm:ss'),
          userDeptLogOutId: null,
        }).unwrap()


        const payloadToSignOutOffice = {
          logOut: format(subMinutes(new Date(), 2), 'yyyy-MM-dd HH:mm:ss'),
          sysLogOut: true,
          returned: true,
        }

        await updateVisitorLog({
          id: visitorStrId as string,
          dateTime: visitorLogSignInDifferentOffice?.strLogIn || '',
          ...payloadToSignOutOffice
        }).unwrap()

        const logDateStr = visitorLogSignInDifferentOffice?.logDate as string
        const parsedDate = parse(logDateStr, 'MM/dd/yyyy', new Date())
        const formattedDate = format(parsedDate, 'yyyy-MM-dd')

        const PayloadSignInOffice = {
          id: visitorLogSignInDifferentOffice?.id as number,
          strId: visitorLogSignInDifferentOffice?.strId as string,
          logIn: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
          logInDate: formattedDate,
          visitorId: visitorLogSignInDifferentOffice?.visitorId as number,
          officeId: Number(departmentCameraEntry?.officeId),
          serviceId: visitorLogSignInDifferentOffice?.serviceId as number,
          returned: false,
          specService: visitorLogSignInDifferentOffice?.specService as string ?? '',
          userLogInId: 0,
        }

        const newfileName = PayloadSignInOffice.logIn.replace(' ', '_').replace(':', "-") + '.png';
        const fileName = format(visitorLogSignInDifferentOffice?.strLogIn as string, 'yyyy-MM-dd HH:mm:ss').replace(" ", "_").replace(":", "-") + '.png';
        await createDuplicatePhotoVisitor({ filename: fileName, newFilename: newfileName })

        const response = await createVisitorLog(PayloadSignInOffice).unwrap()
        // showSuccessToast('Visitor transferred successfully')
        if (response.ghMessage) {
          setShowModal(false)
          resetForm()
        }

        handleDifferentOfficeVisitorLog(visitorLogSignInDifferentOffice as VisitorLog)
        return;
      }

      // If visitor is signing directly to the different office
      console.log('This is will trigger because the visitor is sign in different office')
      const visitorLog = visitorLogSignInDifferentOffice;
      const signOutPayloadDirect: IVisitorSignOutPayload = {
        deptLogOut: format(subMinutes(new Date(), 2), 'yyyy-MM-dd HH:mm:ss'),
        sysDeptLogOut: true
      }


      // Sign Out direct visitor
      await signOutVisitor({
        payload: signOutPayloadDirect,
        dateTime: visitorLog?.strLogIn as string,
        strId: visitorLog?.strId as string
      })

      // Sign In visitor again
      const logDateStr = visitorLogSignInDifferentOffice?.logDate as string
      const parsedDate = parse(logDateStr, 'MM/dd/yyyy', new Date())
      const formattedDate = format(parsedDate, 'yyyy-MM-dd')

      const payloadSignIn: ICreateVisitorLogPayload = {
        id: visitorLogSignInDifferentOffice?.id as number,
        strId: visitorLogSignInDifferentOffice?.strId as string,
        logIn: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        logInDate: formattedDate,
        visitorId: visitorLogSignInDifferentOffice?.visitorId as number,
        officeId: Number(departmentCameraEntry?.officeId),
        serviceId: visitorLogSignInDifferentOffice?.serviceId as number,
        returned: false,
        specService: visitorLogSignInDifferentOffice?.specService as string ?? '',
        userLogInId: 0,
      }

      const newfileName = payloadSignIn.logIn.replace(' ', '_').replace(':', "-") + '.png';
      const fileName = format(visitorLogSignInDifferentOffice?.strLogIn as string, 'yyyy-MM-dd HH:mm:ss').replace(" ", "_").replace(":", "-") + '.png';
      await createDuplicatePhotoVisitor({ filename: fileName, newFilename: newfileName })

      const response = await createVisitorLog(payloadSignIn).unwrap()
      // showSuccessToast('Visitor transferred successfully')
      if (response.ghMessage) {
        setShowModal(false)
        resetForm()
      }

      handleDifferentOfficeVisitorLog(visitorLogSignInDifferentOffice as VisitorLog)
    } catch (error) {
      console.log('Error handling different office visitor:', error)
      showErrorToast('Failed to transfer visitor')
    }
  }, [
    visitorDetailSignInDifferentOffice,
    visitorLogSignInDifferentOffice,
    updateVisitorLog,
    createVisitorLog,
    departmentCameraEntry,
    showErrorToast,
    resetForm,
    handleDifferentOfficeVisitorLog,
    setShowModal
  ])

  const handleCancelDIfferentOffice = useCallback(() => {
    setShowModal(false)
  }, [])

  if (hasPermission === null) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="camera-outline" size={64} color="#EF4444" />
          <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">
            Camera Access Required
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            This app needs camera access to scan QR codes. Please enable camera permissions in your device settings.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
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
              QR Code Scanner
            </Text>
            <TouchableOpacity
              onPress={() => setCameraEnabled(!cameraEnabled)}
              className="p-2"
            >
              <Ionicons
                name={cameraEnabled ? "camera" : "camera-outline"}
                size={24}
                color="#374151"
              />
            </TouchableOpacity>
          </View>
        </View>

        {cameraEnabled ? (
          <View className="flex-1 relative">
            <CameraView
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              style={{ flex: 1 }}
            />

            {/* QR Code Overlay */}
            <QRCodeOverlay scanned={scanned} />

            {/* Bottom Controls */}
            <View className="absolute bottom-0 left-0 right-0 bg-opacity-50 p-4">
              <View className="flex-row justify-center space-x-4">
                {scanned && (
                  <TouchableOpacity
                    onPress={() => setScanned(false)}
                    className="bg-blue-600 px-6 py-3 rounded-lg flex-row items-center"
                  >
                    <Ionicons name="scan" size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">Scan Again</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-600">Camera is disabled</Text>
          </View>
        )}
      </View>

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
                onPress={HandleYesDifferentOffice}
              >
                <Text className="text-white text-center font-medium text-base">
                  Yes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-red-500 py-3 rounded-lg"
                onPress={handleCancelDIfferentOffice}
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