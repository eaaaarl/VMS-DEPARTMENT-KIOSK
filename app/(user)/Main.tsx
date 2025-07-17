import { Camera, CameraView } from 'expo-camera'
import React, { useEffect, useState } from 'react'
import { Alert, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'

export default function Main() {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null)
    const [scanned, setScanned] = useState(false)
    const [cameraEnabled, setCameraEnabled] = useState(true)

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync()
            setHasPermission(status === 'granted')
        }

        getCameraPermissions()
    }, [])

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        setScanned(true)
        Alert.alert(
            'QR Code Scanned',
            `Visitor Code: ${data}`,
            [
                {
                    text: 'Scan Another',
                    onPress: () => setScanned(false)
                }
            ]
        )
        // TODO: Process visitor QR code data here
        console.log('Scanned QR Code:', data)
    }

    if (hasPermission === null) {
        return (
            <View className="flex-1 bg-gray-100 p-5">
                <Text className="text-lg text-center text-gray-800">Requesting camera permission...</Text>
            </View>
        )
    }

    if (hasPermission === false) {
        return (
            <View className="flex-1 bg-gray-100 p-5">
                <Text className="text-lg text-center text-gray-800">No access to camera</Text>
            </View>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-100 p-5">
            <Text className="text-2xl font-bold text-center mb-5 text-gray-800">Scan Visitor QR Code</Text>
            <View className="flex-1 rounded-lg overflow-hidden mb-5 relative">
                <CameraView
                    style={{ flex: 1 }}
                    facing="back"
                    onBarcodeScanned={scanned || !cameraEnabled ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                    }}
                />

                {/* QR Code Scanning Overlay */}
                {cameraEnabled && (
                    <View className="absolute inset-0">
                        {/* Calculate center position for better overlay positioning */}
                        <View className="absolute inset-0 justify-center items-center">
                            <View className="w-64 h-64 relative">
                                {/* Create overlays that surround the scanning area */}
                                <View className="absolute -top-32 -left-32 -right-32 -bottom-32">
                                    {/* Top overlay */}
                                    <View className="absolute top-0 left-0 right-0 bg-black/50" style={{ height: 128 }} />

                                    {/* Bottom overlay */}
                                    <View className="absolute bottom-0 left-0 right-0 bg-black/50" style={{ height: 128 }} />

                                    {/* Left overlay */}
                                    <View className="absolute left-0 bg-black/50" style={{ top: 128, bottom: 128, width: 128 }} />

                                    {/* Right overlay */}
                                    <View className="absolute right-0 bg-black/50" style={{ top: 128, bottom: 128, width: 128 }} />
                                </View>

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

                            {/* Instruction text */}
                            <View className="mt-8 px-4">
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
                    </View>
                )}

                {/* Camera disabled overlay */}
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

            {/* Camera Toggle Button */}
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
        </SafeAreaView>
    )
} ``