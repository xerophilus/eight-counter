import React, { useState, useRef } from 'react';
import { View, Button, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

interface SongUploaderProps {
  onSongUpload: (source: { uri: string; duration: number; bpm: number; type: 'file' | 'spotify' }) => void;
}

export function SongUploader({ onSongUpload }: SongUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ uri: string; duration: number } | null>(null);
  const [taps, setTaps] = useState<number[]>([]);
  const [bpm, setBpm] = useState<number | null>(null);
  const [spotifyTrackId, setSpotifyTrackId] = useState('');
  const [isLoadingSpotify, setIsLoadingSpotify] = useState(false);
  const { spotifyToken } = useAuthStore();

  const handleFileUpload = async () => {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

    setError(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/mpeg' });
      
      if (result.assets && result.assets.length > 0) {
        const { uri } = result.assets[0];
        
        const { sound } = await Audio.Sound.createAsync(
          { uri: uri },
          { shouldPlay: false }
        );

        const status = await sound.getStatusAsync();

        if (status.isLoaded) {
          const durationMillis = status.durationMillis || 0;
          const durationSeconds = durationMillis / 1000;

          await sound.unloadAsync();

          setUploadedFile({ uri, duration: durationSeconds });
          setTaps([]);
          setBpm(null);
        } else {
          throw new Error('Failed to load audio file');
        }
      }
    } catch (err) {
      setError('Error uploading file. Please try again.');
      console.error('Error picking document:', err);
    }
  };

  const handleTap = () => {
    const now = Date.now();
    setTaps(prevTaps => {
      const newTaps = [...prevTaps, now].slice(-4);  // Keep only the last 4 taps
      if (newTaps.length > 1) {
        const intervals = newTaps.slice(1).map((tap, index) => tap - newTaps[index]);
        const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const calculatedBpm = Math.round(60000 / averageInterval);
        setBpm(calculatedBpm);
      }
      return newTaps;
    });
  };

  const handleSubmit = () => {
    if (uploadedFile && bpm) {
      onSongUpload({ ...uploadedFile, bpm, type: 'file' });
    }
  };

  const handleSpotifyUpload = async () => {
    if (!spotifyTrackId || !spotifyToken) {
      setError('Please enter a Spotify track ID and ensure you are logged in to Spotify.');
      return;
    }

    setIsLoadingSpotify(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://getspotifyaudiofeatures-vrjsazxdxa-uc.a.run.app?trackId=${spotifyTrackId}&accessToken=${spotifyToken}`,
      );

      console.log('Response:', response.data);

      if (response.data && response.data.bpm && response.data.duration) {
        onSongUpload({
          uri: `spotify:track:${spotifyTrackId}`,
          duration: response.data.duration,
          bpm: Math.round(response.data.bpm),
          type: 'spotify',
        });
      } else {
        throw new Error('Invalid data received from Spotify');
      }
    } catch (err) {
      console.error('Error fetching Spotify track data:', err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
          setError(`Error ${err.response.status}: ${err.response.data.message || 'Unknown error'}`);
        } else if (err.request) {
          // The request was made but no response was received
          console.error('No response received:', err.request);
          setError('No response received from the server. Please check your network connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up the request:', err.message);
          setError('Error setting up the request. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoadingSpotify(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Upload MP3 File" onPress={handleFileUpload} />
      
      <Text style={styles.orText}>OR</Text>
      
      <View style={styles.spotifyContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Spotify Track ID"
          value={spotifyTrackId}
          onChangeText={setSpotifyTrackId}
        />
        <Button 
          title="Upload from Spotify" 
          onPress={handleSpotifyUpload}
          disabled={isLoadingSpotify || !spotifyTrackId}
        />
      </View>

      {uploadedFile && (
        <>
          <Text>File uploaded. Duration: {uploadedFile.duration.toFixed(2)} seconds</Text>
          <TouchableOpacity style={styles.tapButton} onPress={handleTap}>
            <Text style={styles.tapButtonText}>Tap to the Beat</Text>
          </TouchableOpacity>
          {bpm && <Text>Estimated BPM: {bpm}</Text>}
          <Button title="Submit" onPress={handleSubmit} disabled={!bpm} />
        </>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {isLoadingSpotify && <Text>Loading Spotify track data...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 8,
  },
  tapButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 10,
  },
  tapButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  spotifyContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
  },
});
