import TapDetector from '@/components/TapDetector'
import { Stack } from 'expo-router'
import React from 'react'

export default function ModeLayout() {
    return (
        <TapDetector>
            <Stack screenOptions={{ headerShown: false }} />
        </TapDetector>
    )
}