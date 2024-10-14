import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import * as Sharing from 'expo-sharing';
import { useSheetStore } from '../store/sheetStore';

export function ExportSheet() {
  const { bpm, eightCounts } = useSheetStore();

  const handleExport = async () => {
    const sheetContent = generateSheetContent();

    try {
      await Sharing.shareAsync(
        sheetContent,
        {dialogTitle: '8 Count Sheet'}
      );
    } catch (error) {
      console.error('Error exporting sheet:', error);
    }
  };

  const generateSheetContent = (): string => {
    let content = `BPM: ${bpm}\n\n`;
    eightCounts.forEach((count, index) => {
      content += `Count ${index + 1}:\n${count}\n\n`;
    });
    return content;
  };

  return (
    <View style={styles.container}>
      <Button title="Export Sheet" onPress={handleExport} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
});
