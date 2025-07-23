import React from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';

interface TapDetectorProps {
  onDoubleTap: () => void;
  onSingleTap?: () => void;
  children?: React.ReactNode;
}

export default function TapDetector({ onDoubleTap, onSingleTap, children }: TapDetectorProps) {
  let lastTap = 0;
  const DOUBLE_TAP_DELAY = 300; // milliseconds

  const handleTap = () => {
    const now = Date.now();
    if (lastTap && now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      onDoubleTap();
      lastTap = 0;
    } else {
      // Single tap detected
      lastTap = now;
      if (onSingleTap) {
        setTimeout(() => {
          if (lastTap) {
            onSingleTap();
          }
        }, DOUBLE_TAP_DELAY);
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
}