import React from 'react';
import { Button } from 'react-native';
import { useSpotifyAuth } from '../services/spotifyAuth';
import { useAuthStore } from '../store/authStore';

export function SpotifyAuthButton() {
  const { authResult, authenticate } = useSpotifyAuth();
  const { user, spotifyToken, setSpotifyToken } = useAuthStore();

  React.useEffect(() => {
    if (authResult && user) {
      console.log('Auth result:', authResult);
      setSpotifyToken(authResult.accessToken);
    } else if (authResult && !user) {
      console.error('Spotify authenticated but no user found in store');
    }
  }, [authResult, user, setSpotifyToken]);

  return (
    <Button
      title="Authenticate with Spotify"
      onPress={authenticate}
      disabled={spotifyToken ? true : false}
    />
  );
}
