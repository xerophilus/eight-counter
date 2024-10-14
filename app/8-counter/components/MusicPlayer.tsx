import React, { useState, useEffect, useCallback } from 'react';
import { View, Button, Text, StyleSheet, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { useSheetStore } from '../store/sheetStore';
import { useAuthStore } from '@/store/authStore';

const SPOTIFY_API = 'https://api.spotify.com/v1';

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isSpotifyTrack, setIsSpotifyTrack] = useState(false);
  const { songUri } = useSheetStore();
  const { spotifyToken } = useAuthStore();

  const loadAudioOrFetchSpotifyTrack = useCallback(async () => {
    console.log('token:', spotifyToken);

    if (songUri?.startsWith('spotify:track:')) {
      setIsSpotifyTrack(true);
      await fetchSpotifyTrack(songUri.split(':')[2]);
    } else if (songUri) {
      setIsSpotifyTrack(false);
      await loadLocalAudio();
    } else {
      console.log('No songUri provided');
    }
  }, [songUri, spotifyToken]);

  const loadLocalAudio = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: songUri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      if (status.isLoaded) {
        setSound(newSound);
        setDuration(status.durationMillis || 0);
        console.log('Local audio loaded successfully');
      } else {
        throw new Error('Sound not loaded');
      }
    } catch (error) {
      console.error('Error loading local audio:', error);
      Alert.alert('Error', 'Failed to load audio file. Please try again.');
    }
  };

  const fetchSpotifyTrack = async (trackId: string) => {
    if (!spotifyToken) {
      console.log('No Spotify token available');
      return;
    }

    try {
      const response = await fetch(`${SPOTIFY_API}/tracks/${trackId}`, {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      });
console.log("Spotify Track Info: ", response.json());
      if (response) {
        const data = await response.json();
        setCurrentTrack(data);
        setDuration(data.duration_ms);
        await playSpotifyTrack(data.uri);
      } else {
        console.error('Failed to fetch Spotify track:', response.status);
        Alert.alert('Error', 'Failed to fetch track information from Spotify');
      }
    } catch (error) {
      console.error('Error fetching Spotify track:', error);
      Alert.alert('Error', 'Failed to communicate with Spotify');
    }
  };

  const playSpotifyTrack = async (trackUri: string) => {
    if (!spotifyToken) return;

    try {
      const response = await fetch(`${SPOTIFY_API}/me/player/play`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: [trackUri] }),
      });
      console.log(response.json())
      if (response.status) {
        setIsPlaying(true);
        console.log('Started playing Spotify track');
      } else {
        console.error('Failed to play Spotify track:', response.status);
        Alert.alert('Error', 'Failed to play track on Spotify');
      }
    } catch (error) {
      console.error('Error playing Spotify track:', error);
      Alert.alert('Error', 'Failed to communicate with Spotify');
    }
  };

  const onPlaybackStatusUpdate = (status: Audio.PlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);
    }
  };

  useEffect(() => {
    loadAudioOrFetchSpotifyTrack();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [loadAudioOrFetchSpotifyTrack]);

  const handlePlayPause = async () => {
    console.log('Play/Pause pressed');
    if (isSpotifyTrack) {
      const endpoint = isPlaying ? 'pause' : 'play';
      
      try {
        const response = await fetch(`${SPOTIFY_API}/me/player/${endpoint}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
          },
        });

        if (response) {
          setIsPlaying(!isPlaying);
          console.log(`Spotify playback ${isPlaying ? 'paused' : 'resumed'}`);
        } else {
          console.error(`Failed to ${endpoint} Spotify playback:`, response.status);
          Alert.alert('Error', `Failed to ${isPlaying ? 'pause' : 'resume'} playback on Spotify`);
        }
      } catch (error) {
        console.error(`Error ${isPlaying ? 'pausing' : 'resuming'} Spotify playback:`, error);
        Alert.alert('Error', 'Failed to control Spotify playback');
      }
    } else if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = async (value: number) => {
    console.log('Seek to:', value);
    if (isSpotifyTrack) {
      try {
        const response = await fetch(`${SPOTIFY_API}/me/player/seek?position_ms=${value}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
          },
        });

        if (response.ok) {
          setPosition(value);
          console.log('Spotify seek successful');
        } else {
          console.error('Failed to seek Spotify playback:', response.status);
          Alert.alert('Error', 'Failed to seek on Spotify');
        }
      } catch (error) {
        console.error('Error seeking Spotify playback:', error);
        Alert.alert('Error', 'Failed to seek on Spotify');
      }
    } else if (sound) {
      await sound.setPositionAsync(value);
      setPosition(value);
    }
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <Text>Debug: {isSpotifyTrack ? 'Spotify Track' : 'Local Audio'}</Text>
      {(currentTrack || sound) ? (
        <>
          <Text style={styles.trackInfo}>
            {isSpotifyTrack ? `${currentTrack.name} - ${currentTrack.artists[0].name}` : 'Local Audio'}
          </Text>
          <Text style={styles.timeText}>
            {formatTime(position)} / {formatTime(duration)}
          </Text>
          <Slider
            style={styles.progressBar}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor="#1DB954"
            maximumTrackTintColor="#000000"
          />
          <View style={styles.buttonContainer}>
            <Button
              title={isPlaying ? 'Pause' : 'Play'}
              onPress={handlePlayPause}
            />
          </View>
        </>
      ) : (
        <Text>Loading audio...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 16,
  },
  trackInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
});
