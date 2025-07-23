import TapDetectorForDeveloper from '@/components/TapDetectorForDeveloper';
import { router, Stack } from 'expo-router';
import React, { useCallback } from 'react';
import Toast from 'react-native-toast-message';

export default function ModeLayout() {
    const handleTap = useCallback(() => {
        router.push('/(developer)/DeveloperSetting');

        Toast.show({
            type: 'success',
            position: 'top',
            text1: 'Admin Access',
            text2: 'Configuration IpAddress and Port',
            visibilityTime: 2000,
        });
    }, []);

    return (
        <TapDetectorForDeveloper showToast={true} onMultiTap={handleTap} tapCount={5}>
            <Stack screenOptions={{ headerShown: false }} />
        </TapDetectorForDeveloper>
    )
}