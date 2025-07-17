import { Camera, CameraView } from 'expo-camera'
import React, { useEffect, useState } from 'react'
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native'

export default function Main() {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null)
    const [scanned, setScanned] = useState(false)
    const [cameraEnabled, setCameraEnabled] = useState(true)
    const [inputMethod, setInputMethod] = useState<'camera' | 'manual'>('camera')
    const [ticketId, setTicketId] = useState('')

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync()
            setHasPermission(status === 'granted')
        }
        getCameraPermissions()
    }, [])

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        setScanned(true)
        processTicketData(data)
    }

    const handleManualSubmit = () => {
        if (ticketId.trim() === '') {
            Alert.alert('Error', 'Please enter a ticket ID')
            return
        }
        try {
            processTicketData(ticketId.trim())
        } catch (error) {
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
                                        Point the camera at a visitor's QR code to scan
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
                                        Enter Ticket ID (Very Low - Fixed)
                                    </Text>
                                    <Text className="text-base text-gray-700 mb-4">
                                        Ticket ID:
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
                                        blurOnSubmit={true}
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
        </SafeAreaView >
    )
}