import { useLazyVisitorLogInfoQuery } from '@/feature/visitor/api/visitorApi';
import { useAppSelector } from '@/lib/redux/hooks';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

export default function SignIn() {
  const { LayoutMode } = useAppSelector((state) => state.mode)
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showCamera, setShowCamera] = useState(true);
  const [error, setError] = useState('')
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const router = useRouter();
  const { officeId } = useLocalSearchParams();
  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission]);


  const handleBarcodeScanned = ({ type, data }: { type: string, data: string }) => {
    if (!scanned) {
      setScanned(true);
      Alert.alert(
        'QR Code Scanned!',
        `Ticket Number: ${data}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setScanned(false);
              console.log('Scanned ticket:', data);
            }
          }
        ]
      );
    }
  };

  const [visitorLogInfo, { isLoading: isLoadingVisitorLogInfo }] = useLazyVisitorLogInfoQuery();

  const handleManualSubmit = async () => {
    console.log('Office Id', officeId)
    if (ticketNumber.trim()) {
      try {
        const { data } = await visitorLogInfo({ strId: ticketNumber })
        if (data?.results.length === 0) {
          setError('ID Not in use! Please check your ID');
        } else if (data?.results?.[0].logOut !== null) {
          setError('ID Not in use!');
        } else if (data?.results?.[0].officeId !== Number(officeId)) {
          setShowManualEntry(false)
          setShowCamera(false)
          setShowConfirmationModal(true)
        } else {

        }
      } catch (error) {
        console.log(error)
      }
    } else {
      setError('Please enter a valid ticket number');
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
        <Pressable
          onPress={requestPermission}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* CameraView as background */}
      {showCamera && !showManualEntry && (
        <View style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <CameraView
            style={{ flex: 1 }}
            facing="front"
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
        <Pressable
          onPress={() => {
            if (LayoutMode === 'User') {
              router.replace('/(user)/Main')
            } else if (LayoutMode === 'Kiosk') {
              router.replace('/(main)')
            }
          }}
          className="mt-5 absolute left-4 top-10 bg-black/60 h-10 w-10 rounded-full items-center justify-center z-20 shadow"
        >
          <Text className="text-white text-2xl -mt-0.5">
            <Ionicons name="arrow-back" size={20} color="white" />
          </Text>
        </Pressable>

        <Text className="text-white text-xl font-bold text-center">
          Sign In
        </Text>
        <Text className="text-white/80 text-sm text-center mt-1">
          Scan QR code or enter ticket number
        </Text>
      </View>

      {/* QR Frame Overlay */}
      <View className="absolute inset-0 justify-center items-center" pointerEvents="none">
        <View className="relative items-center">
          <View className="w-64 h-64 border-2 border-white rounded-lg bg-transparent">
            <View className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
            <View className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
            <View className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
            <View className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
            <View className="absolute top-1/2 left-2 right-2 h-0.5 bg-green-400 opacity-60" />
          </View>
          <Text className="text-white text-center mt-4 text-sm">
            Position QR code within the frame
          </Text>
        </View>
      </View>

      {/* <View className="absolute bottom-0 left-0 right-0 bg-black/80 p-6 pb-8">
        <View className="flex-row justify-center gap-4 mb-10">
          <Pressable
            onPress={() => setShowManualEntry(true)}
            className="bg-gray-700 px-6 py-3 rounded-lg flex-1 mr-2"
          >
            <Text className="text-white text-center font-semibold">
              Manual Entry
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setScanned(false)}
            className="bg-blue-500 px-6 py-3 rounded-lg flex-1 ml-2"
          >
            <Text className="text-white text-center font-semibold">
              Scan Again
            </Text>
          </Pressable>
        </View>
      </View> */}

      {/* <Modal
        visible={showManualEntry}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowManualEntry(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white m-6 rounded-lg p-6 w-80">
            <Text className="text-lg font-bold text-gray-800 mb-4 text-center">
              Enter Ticket Number
            </Text>

            {error && (
              <Text className="text-red-500 text-sm mb-2 text-center">{error}</Text>
            )}

            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
              placeholder="Enter your ticket number"
              value={ticketNumber}
              onChangeText={setTicketNumber}
              autoCapitalize="characters"
            />

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  setShowManualEntry(false)
                  setTicketNumber('')
                  setError('')
                }}
                className="bg-gray-300 px-4 py-3 rounded-lg flex-1"
              >
                <Text className="text-gray-700 text-center font-semibold">
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleManualSubmit}
                className="bg-blue-500 px-4 py-3 rounded-lg flex-1"
              >
                <Text className="text-white text-center font-semibold">
                  Submit
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>


      <Modal
        visible={showConfirmationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white m-6 rounded-lg p-6 w-80">
            <Text className="text-lg font-bold text-gray-800 mb-4 text-center">
              Visitor
            </Text>
            <Text className="text-gray-700 text-md mb-2 text-center">
              Not in the office premise of this department, Do you want to sign out previous office automatically?
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowConfirmationModal(false)}
                className="bg-gray-300 px-4 py-3 rounded-lg flex-1"
              >
                <Text className="text-gray-700 text-center font-semibold">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowConfirmationModal(false)
                  console.log('CONFIRM')
                }}
                className="bg-red-500 px-4 py-3 rounded-lg flex-1"
              >
                <Text className="text-white text-center font-semibold">
                  Confirm
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal> */}
    </View>
  );
}