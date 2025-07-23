import { useGetLabelMessageQuery } from '@/feature/label/api/labelApi';
import { VisitorLog } from '@/feature/visitor/api/inteface';
import { useAppSelector } from '@/lib/redux/hooks';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

interface VisitorInformationModalProps {
  visible: boolean
  onClose: () => void
  currentVisitorLog: VisitorLog | null
  purpose: string
  handleChangePurpose: (purpose: string) => void
  onSubmitVisitorLog: () => void,
  idVisitorImage?: string | null,
  photoVisitorImage?: string | null,
  isLoading?: boolean,
}

const VisitorInformationModal = ({
  visible,
  onClose,
  currentVisitorLog,
  purpose,
  handleChangePurpose,
  onSubmitVisitorLog,
  idVisitorImage,
  photoVisitorImage,
  isLoading,
}: VisitorInformationModalProps) => {
  const { ipAddress, port } = useAppSelector((state) => state.config)

  const { data: labelMessageData } = useGetLabelMessageQuery()
  const faceViewLabel = labelMessageData?.find(fbl => fbl.SectionName === 'General' && fbl.KeyName === 'Face View Label')?.Value
  const idViewLabel = labelMessageData?.find(ivl => ivl.SectionName === 'General' && ivl.KeyName === 'ID View Label')?.Value

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
        className="flex-1">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black/50 justify-center items-center px-5">
            <View className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <View className="bg-green-500 py-4 px-5 flex-row justify-center items-center relative">
                <Text className="text-white text-xl font-bold">{currentVisitorLog?.strId}</Text>
                <TouchableOpacity
                  onPress={onClose}
                  className="absolute right-4 p-1"
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              {/* Photo Placeholders */}
              <View className="flex-row p-4 gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-semibold mb-2 text-gray-800">{idViewLabel}</Text>
                  <View className="h-28 rounded-lg justify-center items-center relative border-2 border-red-500 overflow-hidden">
                    {idVisitorImage ? (
                      <Image
                        source={{ uri: `http://${ipAddress}:${port}/uploads/logs/${idVisitorImage}` }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Image
                        source={{ uri: `http://${ipAddress}:${port}/uploads/NoID.gif` }}
                        className="w-full h-full"
                        resizeMode="contain"
                      />
                    )}
                  </View>
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-semibold mb-2 text-gray-800">{faceViewLabel}</Text>
                  <View className="h-28 rounded-lg justify-center items-center relative border-2 border-orange-400 overflow-hidden">
                    {photoVisitorImage ? (
                      <Image
                        source={{ uri: `http://${ipAddress}:${port}/uploads/logs/${photoVisitorImage}` }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Image
                        source={{ uri: `http://${ipAddress}:${port}/uploads/NoFace.gif` }}
                        className="w-full h-full"
                        resizeMode="contain"
                      />
                    )}
                  </View>
                </View>
              </View>

              {/* Visitor Information */}
              <View className="bg-blue-50 mx-4 mb-4 rounded-lg p-4">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-600 text-sm">Visitors Name</Text>
                  <Text className="text-gray-800 font-semibold text-sm">{currentVisitorLog?.name}</Text>
                </View>

                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-600 text-sm">Mobile Number :</Text>
                  <Text className="text-gray-800 font-semibold text-sm">{currentVisitorLog?.contactNo1}</Text>
                </View>

                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-600 text-sm">Office visited :</Text>
                  <Text className="text-gray-800 font-semibold text-sm">{currentVisitorLog?.officeName}</Text>
                </View>

                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-600 text-sm">Reason of visit :</Text>
                  <Text className="text-gray-800 font-semibold text-sm">{currentVisitorLog?.service}</Text>
                </View>

                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-gray-600 text-sm">Time In :</Text>
                  <Text className="text-gray-800 font-semibold text-sm">{currentVisitorLog?.timeIn}</Text>
                </View>

                <View className="mb-4">
                  <Text className="text-gray-600 text-sm mb-2">Purpose :</Text>
                  <View className="relative">
                    <TextInput
                      className="bg-white border border-gray-300 rounded-lg p-3 pr-20 text-sm text-gray-800 min-h-[80px]"
                      placeholder="Specify Purpose"
                      placeholderTextColor="#999"
                      value={purpose}
                      onChangeText={handleChangePurpose}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </View>

                <TouchableOpacity className="bg-blue-500 rounded-lg py-3 justify-center items-center" onPress={onSubmitVisitorLog} disabled={isLoading}>
                  <Text className="text-white font-semibold text-base">{isLoading ? <ActivityIndicator size="small" color="white" /> : 'Enter'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default VisitorInformationModal;