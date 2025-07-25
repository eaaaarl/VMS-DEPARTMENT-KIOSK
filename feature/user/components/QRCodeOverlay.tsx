import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface QRCodeOverlayProps {
  scanned: boolean;
}

const QRCodeOverlay: React.FC<QRCodeOverlayProps> = ({ scanned }) => {
  // Size of the scanning frame
  const frameSize = 230;

  return (
    <View className="absolute inset-0 justify-center items-center">
      {/* Scanning frame with corner borders only */}
      <View style={{
        width: frameSize,
        height: frameSize,
        position: 'relative',
        borderRadius: 24,
      }}>
        {/* Corner indicators - Google Lens style */}
        {/* Top Left */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 40,
          height: 40,
          borderTopWidth: 4,
          borderLeftWidth: 4,
          borderColor: '#4CAF50',
          borderTopLeftRadius: 16,
        }} />

        {/* Top Right */}
        <View style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 40,
          height: 40,
          borderTopWidth: 4,
          borderRightWidth: 4,
          borderColor: '#4285F4',
          borderTopRightRadius: 16,
        }} />

        {/* Bottom Left */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 40,
          height: 40,
          borderBottomWidth: 4,
          borderLeftWidth: 4,
          borderColor: '#FBBC05',
          borderBottomLeftRadius: 16,
        }} />

        {/* Bottom Right */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 40,
          height: 40,
          borderBottomWidth: 4,
          borderRightWidth: 4,
          borderColor: '#EA4335',
          borderBottomRightRadius: 16,
        }} />

        {/* Center focus point when scanned */}
        {scanned && (
          <View style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 24,
            height: 24,
            marginLeft: -12,
            marginTop: -12,
            borderRadius: 12,
            backgroundColor: 'rgba(76, 175, 80, 0.3)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: '#4CAF50',
            }} />
          </View>
        )}
      </View>

      {/* Instructions */}
      <View style={{
        position: 'absolute',
        bottom: 120,
        left: 20,
        right: 20,
        alignItems: 'center',
      }}>
        <View style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          paddingHorizontal: 24,
          paddingVertical: 14,
          borderRadius: 24,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          {scanned ? (
            <ActivityIndicator size="small" color="#4CAF50" style={{ marginRight: 10 }} />
          ) : (
            <Ionicons name="qr-code" size={20} color="#4CAF50" style={{ marginRight: 10 }} />
          )}
          <Text style={{
            color: 'white',
            fontSize: 16,
            fontWeight: '500',
            textAlign: 'center',
          }}>
            {scanned ? 'Processing QR code...' : 'Position QR code within the frame'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default QRCodeOverlay;