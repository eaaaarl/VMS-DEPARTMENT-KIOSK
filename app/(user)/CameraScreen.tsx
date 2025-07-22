import { useGetAllDepartmentQuery } from '@/feature/department/api/deparmentApi'
import { Department } from '@/feature/department/api/interface'
import SignOutModal from '@/feature/user/components/SignOutModal'
import VisitorInformationModal from '@/feature/user/components/VisitorInformationModal'
import { ICreateVisitorLogDetailPayload, VisitorLog, VisitorLogDetail } from '@/feature/visitor/api/inteface'
import { useCreateVisitorLogDetailMutation, useLazyVisitorImageQuery, useLazyVisitorLogInDetailInfoQuery, useLazyVisitorLogInfoQuery, useUpdateVisitorsLogDetailMutation } from '@/feature/visitor/api/visitorApi'
import { formattedDateWithTime } from '@/feature/visitor/utils/formattedDate'
import { useAppSelector } from '@/lib/redux/hooks'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { Camera, CameraView } from 'expo-camera'
import { router } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

// QR Overlay Component
const QRCodeOverlay = ({ scanned }: { scanned: boolean }) => {
  const animatedValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!scanned) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      )
      animation.start()
      return () => animation.stop()
    }
  }, [scanned, animatedValue])

  const scanLinePosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // Adjust based on your overlay size
  })

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {/* Semi-transparent overlay */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }} />

      {/* Scanning area cutout */}
      <View style={{
        width: 250,
        height: 250,
        position: 'relative',
      }}>
        {/* Transparent center */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: 'transparent',
        }} />

        {/* Corner indicators */}
        {/* Top Left */}
        <View style={{
          position: 'absolute',
          top: -2,
          left: -2,
          width: 30,
          height: 30,
          borderTopWidth: 4,
          borderLeftWidth: 4,
          borderColor: '#3B82F6',
          borderTopLeftRadius: 8,
        }} />

        {/* Top Right */}
        <View style={{
          position: 'absolute',
          top: -2,
          right: -2,
          width: 30,
          height: 30,
          borderTopWidth: 4,
          borderRightWidth: 4,
          borderColor: '#3B82F6',
          borderTopRightRadius: 8,
        }} />

        {/* Bottom Left */}
        <View style={{
          position: 'absolute',
          bottom: -2,
          left: -2,
          width: 30,
          height: 30,
          borderBottomWidth: 4,
          borderLeftWidth: 4,
          borderColor: '#3B82F6',
          borderBottomLeftRadius: 8,
        }} />

        {/* Bottom Right */}
        <View style={{
          position: 'absolute',
          bottom: -2,
          right: -2,
          width: 30,
          height: 30,
          borderBottomWidth: 4,
          borderRightWidth: 4,
          borderColor: '#3B82F6',
          borderBottomRightRadius: 8,
        }} />

        {/* Scanning line animation */}
        {!scanned && (
          <Animated.View style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: '#3B82F6',
            transform: [{ translateY: scanLinePosition }],
            shadowColor: '#3B82F6',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
            elevation: 5,
          }} />
        )}
      </View>

      {/* Instructions */}
      <View style={{
        position: 'absolute',
        bottom: 150,
        left: 20,
        right: 20,
        alignItems: 'center',
      }}>
        <View style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 20,
        }}>
          <Text style={{
            color: 'white',
            fontSize: 16,
            fontWeight: '500',
            textAlign: 'center',
          }}>
            {scanned ? 'Processing...' : 'Position QR code within the frame'}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [inputMethod, setInputMethod] = useState<'camera' | 'manual'>('camera')
  const [ticketId, setTicketId] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [showVisitorInformationCheckingModal, setShowVisitorInformationCheckingModal] = useState(false)
  const [currentVisitorLog, setCurrentVisitorLog] = useState<VisitorLog | null>(null)
  const [currentVisitorLogInDetailSignOut, setCurrentVisitorLogInDetailSignOut] = useState<VisitorLogDetail | null>(null)
  const [purpose, setPurpose] = useState('')
  const [idVisitorImage, setIdVisitorImage] = useState<string | null>(null)
  const [photoVisitorImage, setPhotoVisitorImage] = useState<string | null>(null)
  const [showSignOutModal, setShowSignOutModal] = useState(false)

  const { ipAddress, port } = useAppSelector((state) => state.config)
  const { data: departmentData, isLoading: isLoadingDepartmentData } = useGetAllDepartmentQuery()
  const [visitorLogInfo] = useLazyVisitorLogInfoQuery();
  const [visitorLogInDetailInfo] = useLazyVisitorLogInDetailInfoQuery();
  const [visitorImage] = useLazyVisitorImageQuery();

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
            deptId: selectedDepartment?.id as number,
            reason: purpose,
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

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return // Prevent multiple scans

    setScanned(true)

    // Show alert with scanned data
    Alert.alert(
      'QR Code Scanned',
      `Scanned Data: ${data}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            // Reset scan state to allow scanning again
            setTimeout(() => {
              setScanned(false)
            }, 500)
          },
        },
        {
          text: 'Process',
          onPress: () => {
            // Add a small delay before processing
            setTimeout(() => {
              processTicketData(data)
            }, 500)
          },
        },
      ],
      { cancelable: false }
    )
  }


  const processTicketData = async (data: string) => {
    try {
      // Set ticket ID and process automatically
      setTicketId(data)

      const visitorLogInfoData = await visitorLogInfo({ strId: data }).unwrap()
      const visitorLogInDetailData = await visitorLogInDetailInfo({ strId: data }).unwrap()

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
      } else if (visitorLogInfoData?.results?.[0].officeId === Number(selectedDepartment?.officeId) && visitorLogInDetailData?.results?.length === 0) {
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
      // Reset scanned state after processing
      setTimeout(() => {
        setScanned(false)
      }, 2000)
    }
  }

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

        {/* Camera View */}
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