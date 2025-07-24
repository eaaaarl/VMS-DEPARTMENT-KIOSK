import React from 'react'
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native'

interface TicketInputProps {
  ticketId: string
  isSubmitting: boolean
  onChangeTicketId: (text: string) => void
  onSubmit: () => void
}

export const TicketInput: React.FC<TicketInputProps> = ({
  ticketId,
  isSubmitting,
  onChangeTicketId,
  onSubmit
}) => {
  return (
    <View className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <Text className="text-xl font-bold text-gray-800 mb-2">
        Enter Ticket ID
      </Text>
      <Text className="text-gray-600 mb-6">
        Please enter the visitor&apos;s ticket ID manually
      </Text>

      <TextInput
        value={ticketId}
        onChangeText={onChangeTicketId}
        placeholder="Enter ticket ID"
        className="border border-gray-300 rounded-lg px-4 py-4 mb-6 text-gray-800 text-lg"
        placeholderTextColor="#9CA3AF"
        autoFocus={true}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="numeric"
      />

      <TouchableOpacity
        onPress={onSubmit}
        className={`rounded-lg py-4 ${ticketId.trim() && !isSubmitting ? 'bg-blue-600' : 'bg-gray-400'}`}
        disabled={!ticketId.trim() || isSubmitting}
      >
        {isSubmitting ? (
          <View className="flex-row items-center justify-center">
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text className="text-white text-center font-semibold ml-2">
              Processing...
            </Text>
          </View>
        ) : (
          <Text className="text-white text-center font-semibold text-lg">
            Submit
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )
} 