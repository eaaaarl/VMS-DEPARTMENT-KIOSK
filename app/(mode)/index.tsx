import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { DeviceType, LayoutModeType, setDeviceType, setLayoutMode, setOrientation } from '@/lib/redux/state/modeSlice'
import { AntDesign, FontAwesome } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useEffect } from 'react'
import { Dimensions, Platform, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native'

export default function Index() {
    const dispatch = useAppDispatch()
    const currentMode = useAppSelector(state => state.mode.LayoutMode)
    const deviceType = useAppSelector(state => state.mode.deviceType)
    const isLandscape = useAppSelector(state => state.mode.isLandscape)
    const { width, height } = useWindowDimensions()

    useEffect(() => {
        const detectDeviceType = (): DeviceType => {
            // Check if device is a tablet based on screen size and pixel density
            const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
            const screenDiagonal = Math.sqrt(screenWidth * screenWidth + screenHeight * screenHeight)
            // For iOS, we can use idiom
            if (Platform.OS === 'ios' && Platform.isPad) {
                return 'tablet'
            }

            // For Android and other platforms, use screen size
            // Typically, 7" tablets have diagonal of ~900 logical pixels
            return screenDiagonal >= 900 ? 'tablet' : 'mobile'
        }

        // Detect orientation
        const currentIsLandscape = width > height

        dispatch(setDeviceType(detectDeviceType()))
        dispatch(setOrientation(currentIsLandscape))
    }, [width, height, dispatch])

    const handleModeSelect = (mode: LayoutModeType) => {
        dispatch(setLayoutMode(mode))
        // Navigate to appropriate screen after selection
        if (mode === 'Kiosk') {
            router.replace('/(main)/VisitorDashboard')
        } else if (mode === 'User') {
            router.replace('/(user)/UserDashboard')
        }
    }

    // Responsive styles based on device type and orientation
    const getResponsiveStyles = () => {
        // Mobile in portrait mode
        if (deviceType === 'mobile' && !isLandscape) {
            return {
                container: "flex-1 bg-gray-50 justify-center items-center px-4",
                header: "mb-6 items-center",
                title: "text-2xl font-bold text-gray-800 mb-2",
                subtitle: "text-base text-gray-600 text-center",
                cardsContainer: "w-full",
                cardsLayout: "flex-col justify-center gap-4",
                card: "bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 items-center active:scale-95",
                iconContainer: "w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2",
                cardTitle: "text-xl font-bold text-gray-800 mb-1",
                cardText: "text-gray-600 text-center text-sm",
                badge: "mt-2 px-3 py-1 bg-blue-50 rounded-lg",
                badgeText: "text-blue-700 font-medium text-xs",
                footer: "mt-6 items-center",
                footerText: "text-gray-500 text-xs",
                minCardHeight: 150
            }
        }
        // Mobile in landscape mode
        else if (deviceType === 'mobile' && isLandscape) {
            return {
                container: "flex-1 bg-gray-50 justify-center items-center px-4",
                header: "mb-4 items-center",
                title: "text-xl font-bold text-gray-800 mb-1",
                subtitle: "text-sm text-gray-600 text-center",
                cardsContainer: "w-full",
                cardsLayout: "flex-row justify-center gap-4",
                card: "flex-1 bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 items-center active:scale-95",
                iconContainer: "w-10 h-10 bg-blue-100 rounded-full items-center justify-center mb-2",
                cardTitle: "text-lg font-bold text-gray-800 mb-1",
                cardText: "text-gray-600 text-center text-xs",
                badge: "mt-2 px-3 py-1 bg-blue-50 rounded-lg",
                badgeText: "text-blue-700 font-medium text-xs",
                footer: "mt-4 items-center",
                footerText: "text-gray-500 text-xs",
                minCardHeight: 120
            }
        }
        // Tablet in portrait mode
        else if (deviceType === 'tablet' && !isLandscape) {
            return {
                container: "flex-1 bg-gray-50 justify-center items-center px-6",
                header: "mb-8 items-center",
                title: "text-3xl font-bold text-gray-800 mb-3",
                subtitle: "text-lg text-gray-600 text-center",
                cardsContainer: "w-full max-w-xl",
                cardsLayout: "flex-col justify-center gap-6",
                card: "bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 items-center active:scale-95",
                iconContainer: "w-14 h-14 bg-blue-100 rounded-full items-center justify-center mb-3",
                cardTitle: "text-2xl font-bold text-gray-800 mb-2",
                cardText: "text-gray-600 text-center text-base",
                badge: "mt-3 px-4 py-2 bg-blue-50 rounded-lg",
                badgeText: "text-blue-700 font-medium",
                footer: "mt-8 items-center",
                footerText: "text-gray-500 text-sm",
                minCardHeight: 180
            }
        }
        // Tablet in landscape mode (default/original layout)
        else {
            return {
                container: "flex-1 bg-gray-50 justify-center items-center px-8",
                header: "mb-12 items-center",
                title: "text-4xl font-bold text-gray-800 mb-4",
                subtitle: "text-lg text-gray-600 text-center",
                cardsContainer: "w-full max-w-2xl",
                cardsLayout: "flex-row justify-center gap-8",
                card: "flex-1 bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 items-center hover:border-blue-500 active:scale-95",
                iconContainer: "w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4",
                cardTitle: "text-2xl font-bold text-gray-800 mb-2",
                cardText: "text-gray-600 text-center text-base",
                badge: "mt-4 px-4 py-2 bg-blue-50 rounded-lg",
                badgeText: "text-blue-700 font-medium",
                footer: "mt-12 items-center",
                footerText: "text-gray-500 text-sm",
                minCardHeight: 200
            }
        }
    }

    const styles = getResponsiveStyles()

    return (
        <View className={styles.container}>
            <View className={styles.header}>
                <Text className={styles.title}>
                    VMS - Department
                </Text>
                <Text className={styles.subtitle}>
                    Please select your access mode
                </Text>
            </View>

            <View className={styles.cardsContainer}>
                <View className={styles.cardsLayout}>
                    <TouchableOpacity
                        onPress={() => handleModeSelect('Kiosk')}
                        className={styles.card}
                        style={{ minHeight: styles.minCardHeight }}
                    >
                        <View className={styles.iconContainer}>
                            <FontAwesome name="building-o" size={deviceType === 'mobile' ? 18 : 24} color="black" />
                        </View>
                        <Text className={styles.cardTitle}>
                            Visitor Mode
                        </Text>
                        <Text className={styles.cardText}>
                            For visitors to register, check-in and access department services
                        </Text>
                        <View className={styles.badge}>
                            <Text className={styles.badgeText}>
                                Public kiosk interface
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleModeSelect('User')}
                        className={styles.card}
                        style={{ minHeight: styles.minCardHeight }}
                    >
                        <View className={`${styles.iconContainer} bg-green-100`}>
                            <AntDesign name="user" size={deviceType === 'mobile' ? 18 : 24} color="black" />
                        </View>
                        <Text className={styles.cardTitle}>
                            Staff Mode
                        </Text>
                        <Text className={styles.cardText}>
                            For staff members to scan visitor QR codes and manage visits
                        </Text>
                        <View className={`${styles.badge} bg-green-50`}>
                            <Text className={`${styles.badgeText} text-green-700`}>
                                QR code scanner interface
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {currentMode && (
                <View className={`mt-${deviceType === 'mobile' ? '4' : '8'} px-${deviceType === 'mobile' ? '4' : '6'} py-${deviceType === 'mobile' ? '2' : '3'} bg-gray-800 rounded-full`}>
                    <Text className={`text-white font-medium ${deviceType === 'mobile' ? 'text-xs' : ''}`}>
                        Current Mode: {currentMode}
                    </Text>
                </View>
            )}

            <View className={styles.footer}>
                <Text className={styles.footerText}>
                    You can change this setting anytime in the app
                </Text>
            </View>
        </View>
    )
}