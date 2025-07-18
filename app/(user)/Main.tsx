import { useGetAllDepartmentQuery } from '@/feature/department/api/deparmentApi'
import { Department } from '@/feature/department/api/interface'
import VisitorInformationModal from '@/feature/user/components/VisitorInformationModal'
import { VisitorLog } from '@/feature/visitor/api/inteface'
import { useLazyVisitorImageQuery, useLazyVisitorLogInDetailInfoQuery, useLazyVisitorLogInfoQuery } from '@/feature/visitor/api/visitorApi'
import { Ionicons } from '@expo/vector-icons'
import { Camera, CameraView } from 'expo-camera'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native'
import Toast from 'react-native-toast-message'

export default function Main() {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null)
    const [scanned, setScanned] = useState(false)
    const [cameraEnabled, setCameraEnabled] = useState(true)
    const [inputMethod, setInputMethod] = useState<'camera' | 'manual'>('camera')
    const [ticketId, setTicketId] = useState('')
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
    const [showDepartmentModal, setShowDepartmentModal] = useState(false)
    const [showVisitorInformationCheckingModal, setShowVisitorInformationCheckingModal] = useState(false)
    const [currentVisitorLog, setCurrentVisitorLog] = useState<VisitorLog | null>(null)
    const [purpose, setPurpose] = useState('')
    const [idVisitorImage, setIdVisitorImage] = useState<string | null>(null)
    const [photoVisitorImage, setPhotoVisitorImage] = useState<string | null>(null)

    const { data: departmentData, isLoading: isLoadingDepartmentData } = useGetAllDepartmentQuery()
    const [visitorLogInfo, { isLoading: isLoadingVisitorLogInfo }] = useLazyVisitorLogInfoQuery();
    const [visitorLogInDetailInfo, { isLoading: isLoadingVisitorLogInDetailInfo }] = useLazyVisitorLogInDetailInfoQuery();
    const [visitorImage, { isLoading: isLoadingVisitorImage }] = useLazyVisitorImageQuery();

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync()
            setHasPermission(status === 'granted')
            return;
        }

        const checkingDepartment = async () => {
            if (!selectedDepartment) {
                setShowDepartmentModal(true)
                return;
            }
        }

        getCameraPermissions()
        checkingDepartment()
    }, [selectedDepartment])

    const handleChangePurpose = (purpose: string) => {
        setPurpose(purpose)
    }

    const handleSubmitVisitorLog = () => {
        try {

        } catch (error) {

        }
    }

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        setScanned(true)
        processTicketData(data)
    }

    const handleManualSubmit = async () => {
        if (ticketId.trim() === '') {
            Alert.alert('Error', 'Please enter a ticket ID')
            return
        }
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
            }
        } catch (error) {
            console.log(error)
            Alert.alert('Error', 'Failed to process ticket')
        }
    }

    const processTicketData = (data: string) => {
        Alert.alert(
            'Ticket Processed',
            `Visitor Code: ${data}`,
            [
                {
                    text: 'Process Another',
                    onPress: () => {
                        setScanned(false)
                        setTicketId('')
                    }
                }
            ]
        )
        console.log('Processed Ticket:', data)
    }

    if (hasPermission === null && inputMethod === 'camera') {
        return (
            <View className="flex-1 bg-gray-100 p-5">
                <Text className="text-lg text-center text-gray-800">Requesting camera permission...</Text>
            </View>
        )
    }

    if (hasPermission === false && inputMethod === 'camera') {
        return (
            <SafeAreaView className="flex-1 bg-gray-100 p-5">
                <Text className="text-lg text-center text-gray-800 mb-4">No access to camera</Text>
                <TouchableOpacity
                    onPress={() => setInputMethod('manual')}
                    className="bg-blue-500 px-6 py-3 rounded-lg"
                >
                    <Text className="text-white text-lg font-bold text-center">
                        Use Manual Entry Instead
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }



    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <View className="p-5">
                <Text className="text-2xl font-bold text-center mb-5 text-gray-800">
                    Visitor Entry System
                </Text>
                <View className="flex-row bg-gray-200 rounded-lg p-2 mb-5 gap-2">
                    <TouchableOpacity
                        onPress={() => setInputMethod('camera')}
                        className={`flex-1 py-3 rounded-lg ${inputMethod === 'camera' ? 'bg-blue-500' : 'bg-transparent'
                            }`}
                    >
                        <Text className={`text-center font-bold ${inputMethod === 'camera' ? 'text-white' : 'text-gray-700'
                            }`}>
                            Scan QR Code
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setInputMethod('manual')}
                        className={`flex-1 py-3 rounded-lg ${inputMethod === 'manual' ? 'bg-blue-500' : 'bg-transparent'
                            }`}
                    >
                        <Text className={`text-center font-bold ${inputMethod === 'manual' ? 'text-white' : 'text-gray-700'
                            }`}>
                            Manual Entry
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {inputMethod === 'camera' && (
                <View className="flex-1 p-5">
                    <View className="flex-1 rounded-lg overflow-hidden mb-5 relative">
                        <CameraView
                            style={{ flex: 1 }}
                            facing="back"
                            onBarcodeScanned={scanned || !cameraEnabled ? undefined : handleBarCodeScanned}
                            barcodeScannerSettings={{
                                barcodeTypes: ['qr'],
                            }}
                        />
                        {cameraEnabled && (
                            <View className="absolute inset-0">
                                <View className="absolute inset-0 justify-center items-center">
                                    {/* Full screen overlay with scanning area cutout */}
                                    <View className="absolute inset-0">
                                        {/* Top overlay */}
                                        <View className="absolute top-0 left-0 right-0 bg-black/50" />

                                        {/* Bottom overlay */}
                                        <View className="absolute bottom-0 left-0 right-0 bg-black/50" />

                                        {/* Left overlay */}
                                        <View className="absolute left-0 bg-black/50" />

                                        {/* Right overlay */}
                                        <View className="absolute right-0 bg-black/50" />
                                    </View>

                                    {/* Scanning area frame - perfectly centered */}
                                    <View className="w-64 h-64 relative">
                                        {/* Corner brackets */}
                                        <View className="absolute -top-1 -left-1 w-12 h-12">
                                            <View className="absolute top-0 left-0 w-12 h-1 bg-white rounded-full" />
                                            <View className="absolute top-0 left-0 w-1 h-12 bg-white rounded-full" />
                                        </View>
                                        <View className="absolute -top-1 -right-1 w-12 h-12">
                                            <View className="absolute top-0 right-0 w-12 h-1 bg-white rounded-full" />
                                            <View className="absolute top-0 right-0 w-1 h-12 bg-white rounded-full" />
                                        </View>
                                        <View className="absolute -bottom-1 -left-1 w-12 h-12">
                                            <View className="absolute bottom-0 left-0 w-12 h-1 bg-white rounded-full" />
                                            <View className="absolute bottom-0 left-0 w-1 h-12 bg-white rounded-full" />
                                        </View>
                                        <View className="absolute -bottom-1 -right-1 w-12 h-12">
                                            <View className="absolute bottom-0 right-0 w-12 h-1 bg-white rounded-full" />
                                            <View className="absolute bottom-0 right-0 w-1 h-12 bg-white rounded-full" />
                                        </View>

                                        {/* Scanning line effect */}
                                        <View className="absolute inset-0 justify-center">
                                            <View className="w-full h-0.5 bg-white/60 shadow-lg shadow-white/30" />
                                        </View>
                                    </View>
                                </View>

                                {/* Instruction text - positioned below the scanning area */}
                                <View className="absolute bottom-0 left-0 right-0 pb-20 px-4">
                                    <Text className="text-white text-xl font-bold text-center mb-2">
                                        Scan QR Code
                                    </Text>
                                    <Text className="text-white text-base text-center">
                                        Point the camera at a visitor&apos;s QR code to scan
                                    </Text>
                                </View>

                                {/* Scanned overlay */}
                                {scanned && (
                                    <View className="absolute inset-0 bg-black/70 justify-center items-center">
                                        <Text className="text-white text-lg font-bold">QR Code Scanned!</Text>
                                    </View>
                                )}
                            </View>
                        )}
                        {!cameraEnabled && (
                            <View className="absolute inset-0 bg-black/90 justify-center items-center">
                                <Text className="text-white text-xl font-bold text-center mb-4">
                                    Camera Disabled
                                </Text>
                                <Text className="text-white text-base text-center">
                                    Turn on the camera to scan QR codes
                                </Text>
                            </View>
                        )}
                    </View>
                    <View className="flex-row justify-center mt-4">
                        <TouchableOpacity
                            onPress={() => setCameraEnabled(!cameraEnabled)}
                            className={`px-6 py-3 rounded-lg ${cameraEnabled ? 'bg-red-500' : 'bg-green-500'}`}
                        >
                            <Text className="text-white text-lg font-bold">
                                {cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Text className="text-base text-center text-gray-600 mt-2">
                        Toggle camera on/off as needed
                    </Text>
                </View>
            )}

            {inputMethod === 'manual' && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 1 : 25}
                    className="flex-1"
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <ScrollView
                            contentContainerStyle={{ flexGrow: 1 }}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View className="flex-1 px-4 justify-center">
                                <View className="bg-white rounded-lg p-6 shadow-lg">
                                    <Text className="text-xl font-bold text-center mb-6 text-gray-800">
                                        Enter Ticket ID
                                    </Text>

                                    <TextInput
                                        value={ticketId}
                                        onChangeText={setTicketId}
                                        placeholder="Enter visitor ticket ID"
                                        className="border border-gray-300 rounded-lg px-4 py-3 text-lg mb-4"
                                        autoCapitalize="characters"
                                        autoCorrect={false}
                                        returnKeyType="done"
                                        onSubmitEditing={handleManualSubmit}
                                        placeholderTextColor={'gray'}
                                    />
                                    <TouchableOpacity
                                        onPress={handleManualSubmit}
                                        className="bg-blue-500 py-4 rounded-lg"
                                    >
                                        <Text className="text-white text-lg font-bold text-center">
                                            Submit Ticket ID
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            )
            }

            <Modal
                visible={showDepartmentModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowDepartmentModal(false)}
            >
                <View className="flex-1 bg-black/30 justify-center items-center px-4">
                    <View style={{ height: 500 }} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                        <View className="bg-blue-500 px-6 py-4 flex-row justify-between items-center">
                            <Text className="text-white text-xl font-bold">SELECT DEPARTMENT</Text>
                            <TouchableOpacity
                                onPress={() => setShowDepartmentModal(false)}
                                className="p-2 rounded-full bg-white/20"
                            >
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row px-6 py-4 border-b border-gray-200">
                            <Text className="flex-1 text-center text-gray-700 font-semibold text-base">Department Name</Text>
                            <Text className="flex-1 text-center text-gray-700 font-semibold text-base">Office Name</Text>
                            <Text className="w-16 text-center text-gray-700 font-semibold text-base">Select</Text>
                        </View>
                        <ScrollView className="flex-1 px-6 py-4">
                            <View className="gap-2">
                                {isLoadingDepartmentData && (
                                    <View className="flex-1 justify-center items-center">
                                        <ActivityIndicator size="large" color="#0000ff" />
                                    </View>
                                )}
                                {departmentData?.results?.map((dept) => (
                                    <TouchableOpacity
                                        key={dept.id}
                                        onPress={() => {
                                            setSelectedDepartment(dept)
                                        }}
                                        activeOpacity={0.2}
                                    >
                                        <View className={`flex-row items-center py-4 px-3 rounded-lg ${selectedDepartment?.id === dept.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                                            }`}>
                                            <Text className="flex-1 text-gray-800 text-base font-medium">{dept.name}</Text>
                                            <Text className="flex-1 text-center text-gray-700 text-base font-medium">{dept.officeName}</Text>

                                            {/* Radio Button Indicator */}
                                            <View className="w-16 items-center justify-center">
                                                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedDepartment?.id === dept.id
                                                    ? 'border-blue-500 bg-blue-500'
                                                    : 'border-gray-300 bg-white'
                                                    }`}>
                                                    {selectedDepartment?.id === dept.id && (
                                                        <View className="w-2 h-2 rounded-full bg-white" />
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                        <View className="p-6 py-4 border-t border-gray-200 bg-gray-50">
                            <TouchableOpacity
                                onPress={() => {
                                    if (selectedDepartment) {
                                        setShowDepartmentModal(false);
                                    }
                                }}
                                disabled={!selectedDepartment}
                                className={`py-4 px-6 rounded-xl ${selectedDepartment
                                    ? 'bg-blue-500'
                                    : 'bg-gray-300'
                                    }`}
                            >
                                <Text className={`text-center font-semibold text-base ${selectedDepartment ? 'text-white' : 'text-gray-500'
                                    }`}>
                                    Select Department
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <VisitorInformationModal
                visible={showVisitorInformationCheckingModal}
                onClose={() => setShowVisitorInformationCheckingModal(false)}
                currentVisitorLog={currentVisitorLog}
                purpose={purpose}
                handleChangePurpose={handleChangePurpose}
                onSubmitVisitorLog={handleSubmitVisitorLog}
                idVisitorImage={idVisitorImage}
                photoVisitorImage={photoVisitorImage}
            />
        </SafeAreaView >
    )
}