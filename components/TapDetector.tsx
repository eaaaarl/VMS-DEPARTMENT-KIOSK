import { router } from 'expo-router';
import React, { ReactNode, useEffect, useState } from 'react';
import { Alert, TouchableWithoutFeedback, View } from 'react-native';

interface TapDetectorProps {
  children: ReactNode;
  TAPS_COUNT_THRESHOLD?: number;
  TAP_TIMEOUT?: number;
  showAlert?: boolean;
  alertTitle?: string;
  alertMessage?: string;
  onThresholdReached?: () => void;
}

const TapDetector = ({
  children,
  TAPS_COUNT_THRESHOLD = 5,
  TAP_TIMEOUT = 3000,
  showAlert = true,
  alertTitle = "Developer Mode",
  alertMessage = "Developer settings unlocked!",
  onThresholdReached
}: TapDetectorProps) => {
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

  useEffect(() => {
    if (tapCount === 0) return;

    const timer = setTimeout(() => {
      setTapCount(0);
    }, TAP_TIMEOUT);

    return () => clearTimeout(timer);
  }, [tapCount, TAP_TIMEOUT]);

  const handleTap = () => {
    const now = Date.now();

    if (now - lastTapTime > TAP_TIMEOUT) {
      setTapCount(1);
    } else {
      const newCount = tapCount + 1;
      setTapCount(newCount);

      if (newCount >= TAPS_COUNT_THRESHOLD) {
        setTapCount(0);

        if (showAlert) {
          Alert.alert(
            alertTitle,
            alertMessage,
            [
              {
                text: "Cancel",
                style: "cancel"
              },
              {
                text: "Open Settings",
                onPress: () => {
                  if (onThresholdReached) {
                    onThresholdReached();
                  } else {
                    router.push('/(developer)/DeveloperSetting');
                  }
                }
              }
            ]
          );
        } else {
          if (onThresholdReached) {
            onThresholdReached();
          } else {
            router.push('/(developer)/DeveloperSetting');
          }
        }
      }
      else if (newCount >= TAPS_COUNT_THRESHOLD - 2) {
        const remaining = TAPS_COUNT_THRESHOLD - newCount;
        Alert.alert(
          "Almost there...",
          `${remaining} more tap${remaining > 1 ? 's' : ''} to unlock developer mode`,
          [{ text: "OK" }],
          { cancelable: true }
        );
      }
    }

    setLastTapTime(now);
  };

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default TapDetector;