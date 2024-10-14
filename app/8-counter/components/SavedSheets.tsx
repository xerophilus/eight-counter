import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSheetStore } from '../store/sheetStore';

interface SavedSheet {
  id: string;
  title: string;
}

export function SavedSheets() {
  const [savedSheets, setSavedSheets] = useState<SavedSheet[]>([]);
  const { getSavedSheets, loadSheet } = useSheetStore();

  useEffect(() => {
    fetchSavedSheets();
  }, []);

  const fetchSavedSheets = async () => {
    const sheets = await getSavedSheets();
    setSavedSheets(sheets);
  };

  const handleLoadSheet = (sheetId: string) => {
    loadSheet(sheetId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Sheets</Text>
      <FlatList
        data={savedSheets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleLoadSheet(item.id)} style={styles.sheetItem}>
            <Text>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sheetItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
