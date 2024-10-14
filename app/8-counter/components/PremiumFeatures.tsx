import React from 'react';
import { View, Button, Text } from 'react-native';
import { usePremiumStore } from '../store/premiumStore';

export function PremiumFeatures() {
  const { isPremium, setPremiumStatus } = usePremiumStore();

  const handlePurchase = async () => {
    // Implement in-app purchase logic here
    // If purchase is successful, call setPremiumStatus(true)
  };

  if (isPremium) {
    return (
      <View>
        <Text>You have access to premium features!</Text>
        {/* Render premium features here */}
      </View>
    );
  }

  return (
    <View>
      <Text>Upgrade to Premium for advanced features!</Text>
      <Button title="Go Premium" onPress={handlePurchase} />
    </View>
  );
}
