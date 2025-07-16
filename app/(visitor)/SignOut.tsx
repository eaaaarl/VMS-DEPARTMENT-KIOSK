import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignOut() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [showCamera, setShowCamera] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarcodeScanned = ({ type, data }: { type: string, data: string }) => {
    if (!scanned) {
      setScanned(true);
      Alert.alert(
        'QR Code Scanned!',
        `Sign Out Ticket: ${data}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setScanned(false);
              console.log('Scanned sign out ticket:', data);
              // Process sign out logic here
            }
          }
        ]
      );
    }
  };

  const handleManualSubmit = () => {
    if (ticketNumber.trim()) {
      Alert.alert(
        'Sign Out Confirmed!',
        `Ticket Number: ${ticketNumber}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setTicketNumber('');
              setShowManualEntry(false);
              console.log('Manual sign out ticket:', ticketNumber);
              // Process sign out logic here
            }
          }
        ]
      );
    } else {
      Alert.alert('Error', 'Please enter a valid ticket number');
    }
  };

  if (!permission) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-lg text-gray-600">Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 px-6">
        <Text className="text-lg text-gray-800 text-center mb-6">
          Camera permission is required to scan QR codes
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-red-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* CameraView as background */}
      {showCamera && (
        <View style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />
        </View>
      )}

      {/* Overlay UI */}
      <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 pt-12 pb-4">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-4 top-10 bg-black/60 h-10 w-10 rounded-full items-center justify-center z-20 shadow"
          activeOpacity={0.7}
        >
          <Text className="text-white text-2xl -mt-0.5">
            <Ionicons name="arrow-back" size={20} color="white" />
          </Text>
        </TouchableOpacity>

        <Text className="text-white text-xl font-bold text-center">
          Sign Out
        </Text>
        <Text className="text-white/80 text-sm text-center mt-1">
          Scan QR code or enter ticket number to sign out
        </Text>
      </View>

      {/* QR Frame Overlay */}
      <View className="absolute inset-0 justify-center items-center" pointerEvents="none">
        <View className="relative items-center">
          <View className="w-64 h-64 border-2 border-white rounded-lg bg-transparent">
            <View className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-red-400 rounded-tl-lg" />
            <View className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-red-400 rounded-tr-lg" />
            <View className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-red-400 rounded-bl-lg" />
            <View className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-red-400 rounded-br-lg" />
            <View className="absolute top-1/2 left-2 right-2 h-0.5 bg-red-400 opacity-60" />
          </View>
          <Text className="text-white text-center mt-4 text-sm">
            Position QR code within the frame to sign out
          </Text>
        </View>
      </View>

      {/* Bottom Controls */}
      <View className="absolute bottom-0 left-0 right-0 bg-black/80 p-6 pb-8">
        <View className="flex-row justify-center gap-4 mb-4">
          <TouchableOpacity
            onPress={() => setShowManualEntry(true)}
            className="bg-gray-700 px-6 py-3 rounded-lg flex-1 mr-2"
          >
            <Text className="text-white text-center font-semibold">
              Manual Entry
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setScanned(false)}
            className="bg-red-500 px-6 py-3 rounded-lg flex-1 ml-2"
          >
            <Text className="text-white text-center font-semibold">
              Scan Again
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Manual Entry Modal */}
      <Modal
        visible={showManualEntry}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowManualEntry(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white m-6 rounded-lg p-6 w-80">
            <Text className="text-lg font-bold text-gray-800 mb-4 text-center">
              Enter Ticket Number to Sign Out
            </Text>

            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
              placeholder="Enter your ticket number"
              value={ticketNumber}
              onChangeText={setTicketNumber}
              autoCapitalize="characters"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowManualEntry(false)}
                className="bg-gray-300 px-4 py-3 rounded-lg flex-1"
              >
                <Text className="text-gray-700 text-center font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleManualSubmit}
                className="bg-red-500 px-4 py-3 rounded-lg flex-1"
              >
                <Text className="text-white text-center font-semibold">
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}