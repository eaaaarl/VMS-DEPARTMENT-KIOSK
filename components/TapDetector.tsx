import React, { useEffect, useState } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import Toast from 'react-native-toast-message';

interface TapDetectorProps {
  onMultiTap: () => void;
  tapCount?: number;
  resetDelay?: number;
  showToast?: boolean;
  children?: React.ReactNode;
}

export default function TapDetector({
  onMultiTap,
  tapCount = 5,
  resetDelay = 2000,
  showToast = true,
  children
}: TapDetectorProps) {
  const [taps, setTaps] = useState(0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (taps >= tapCount) {
      onMultiTap();
      setTaps(0);
    } else if (taps > 0) {
      // Show toast notification if enabled
      if (showToast) {
        const remaining = tapCount - taps;
        Toast.show({
          type: 'info',
          position: 'bottom',
          text1: `${remaining} more ${remaining === 1 ? 'tap' : 'taps'} to access settings`,
          visibilityTime: 1000,
          autoHide: true,
        });
      }

      // Reset tap count after delay
      timeoutId = setTimeout(() => {
        setTaps(0);
      }, resetDelay);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [taps, tapCount, resetDelay, onMultiTap, showToast]);

  const handleTap = () => {
    setTaps(prev => prev + 1);
  };

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
}