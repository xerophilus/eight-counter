import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Button, TouchableOpacity, Modal } from 'react-native';
import { useSheetStore } from '../store/sheetStore';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SheetCreatorProps {
  songDuration: number;
}

// Define a type for the count state
type CountState = ' ' | 'X' | string;

export function SheetCreator({ songDuration }: SheetCreatorProps) {
  const { bpm, eightCounts, setBpm, setEightCounts, updateEightCount, saveSheet } = useSheetStore();
  const [title, setTitle] = useState('');
  const [editingCount, setEditingCount] = useState<{ eightCountIndex: number; countIndex: number } | null>(null);

  useEffect(() => {
    if (songDuration && bpm) {
      const beatsPerSecond = bpm / 60;
      const totalBeats = songDuration * beatsPerSecond;
      const totalEightCounts = Math.ceil(totalBeats / 8);
      setEightCounts(Array(totalEightCounts).fill('        '));
    }
  }, [songDuration, bpm, setEightCounts]);

  const handleSave = async () => {
    if (title.trim()) {
      await saveSheet(title);
      setTitle('');
    }
  };

  const handleBpmChange = (text: string) => {
    const newBpm = parseInt(text) || 120;
    setBpm(newBpm);
  };

  const handleCountPress = (eightCountIndex: number, countIndex: number) => {
    const currentCount = eightCounts[eightCountIndex][countIndex] as CountState;
    if (currentCount !== 'X') {
      setEditingCount({ eightCountIndex, countIndex });
    }
  };

  const handleCountLongPress = (eightCountIndex: number, countIndex: number) => {
    const currentCount = eightCounts[eightCountIndex][countIndex] as CountState;
    updateCount(eightCountIndex, countIndex, currentCount === 'X' ? ' ' : 'X');
  };

  const handleCountEdit = (text: string) => {
    if (editingCount) {
      const { eightCountIndex, countIndex } = editingCount;
      updateCount(eightCountIndex, countIndex, text[0] || ' ');
      setEditingCount(null);
    }
  };

  const updateCount = (eightCountIndex: number, countIndex: number, newValue: CountState) => {
    const currentEightCount = eightCounts[eightCountIndex];
    const updatedEightCount = 
      currentEightCount.substring(0, countIndex) +
      newValue +
      currentEightCount.substring(countIndex + 1);
    updateEightCount(eightCountIndex, updatedEightCount);
  };

  const getCountStyle = (count: CountState) => {
    if (count === 'X') {
      return [styles.countSquare, styles.blockedSquare];
    }
    return styles.countSquare;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>Sheet Title:</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter sheet title"
      />
      <Text style={styles.label}>BPM:</Text>
      <TextInput
        style={styles.input}
        value={bpm.toString()}
        onChangeText={handleBpmChange}
        keyboardType="numeric"
      />
      <ScrollView style={styles.sheetContainer}>
        {eightCounts.map((eightCount, eightCountIndex) => (
          <View key={eightCountIndex} style={styles.eightCountContainer}>
            <Text style={styles.eightCountLabel}>{eightCountIndex + 1}</Text>
            <View style={styles.countGrid}>
              {Array.from(eightCount).map((count, countIndex) => (
                <TouchableOpacity
                  key={countIndex}
                  style={getCountStyle(count as CountState)}
                  onPress={() => handleCountPress(eightCountIndex, countIndex)}
                  onLongPress={() => handleCountLongPress(eightCountIndex, countIndex)}
                  delayLongPress={500}
                >
                  <Text>{count !== ' ' && count !== 'X' ? count : ''}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      <Button title="Save Sheet" onPress={handleSave} disabled={!title.trim()} />

      <Modal visible={editingCount !== null} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.modalInput}
              value={editingCount ? eightCounts[editingCount.eightCountIndex][editingCount.countIndex] : ''}
              onChangeText={handleCountEdit}
              maxLength={1}
              autoFocus
            />
            <Button title="Close" onPress={() => setEditingCount(null)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  sheetContainer: {
    flex: 1,
    marginBottom: 16,
  },
  eightCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eightCountLabel: {
    width: 30,
    fontWeight: 'bold',
  },
  countGrid: {
    flexDirection: 'row',
    flex: 1,
  },
  countSquare: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    width: 50,
    textAlign: 'center',
    fontSize: 18,
  },
  blockedSquare: {
    backgroundColor: '#ccc',
  },
});
