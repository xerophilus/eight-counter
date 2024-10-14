import React from 'react';
import { Button, Text, StyleSheet, ScrollView } from 'react-native';
import { SongUploader } from '../../components/SongUploader';
import { SheetCreator } from '../../components/SheetCreator';
import { MusicPlayer } from '../../components/MusicPlayer';
import { ExportSheet } from '../../components/ExportSheet';
import { SavedSheets } from '../../components/SavedSheets';
import { useSheetStore } from '../../store/sheetStore';
import { SpotifyAuthButton } from '@/components/SpotifyAuthButton';
import { useAuthStore } from '@/store/authStore';

export default function MainScreen() {
  const { setSongInfo, songDuration } = useSheetStore();
  const { logout } = useAuthStore();
  const handleSongUpload = (source: { uri: string; duration: number; bpm: number; type: 'file' | 'spotify' }) => {
    setSongInfo(source.uri, source.duration);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>8-Count Choreographer</Text>
      <SpotifyAuthButton />
      <SongUploader onSongUpload={handleSongUpload} />
      <MusicPlayer />
      {songDuration && <SheetCreator songDuration={songDuration} />}
      <ExportSheet />
      <SavedSheets />
      <Button title={"Logout"} onPress={logout}/>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
