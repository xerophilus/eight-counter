import React, { useState } from 'react';
import { View, Button, StyleSheet, Modal, Text } from 'react-native';
import * as Sharing from 'expo-sharing';
import { useSheetStore } from '../store/sheetStore';
import styled from 'styled-components/native';

export function ExportSheet() {
  const { bpm, eightCounts } = useSheetStore();
  const [showModal, setShowModal] = useState(false);

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
      <Button title="Export Sheet" onPress={() => setShowModal(true)} />
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => {
          setShowModal(!showModal);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text>Are you sure you want to export this sheet?</Text>
            <ExportButton onPress={handleExport} title="Confirm Export" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
});

const ExportButton = styled(Button)`
  background-color: #007AFF;
  color: white;
`;

const centeredView = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
});

const modalView = StyleSheet.create({
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
