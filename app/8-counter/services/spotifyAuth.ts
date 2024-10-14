import Constants from 'expo-constants';
import { makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session';
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

interface SpotifyAuthResult {
  type: 'success' | 'error';
  accessToken?: string;
  error?: string;
}

const clientId = Constants.expoConfig?.extra?.spotifyClientId;
const redirectUri = makeRedirectUri({
  scheme: 'eightcounter',
});

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
};

export function useSpotifyAuth() {
  const [authResult, setAuthResult] = useState<SpotifyAuthResult | null>(null);

  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: clientId,
      scopes: ['user-read-email', 'playlist-modify-public', 'user-modify-playback-state', 'user-read-playback-state'],
      redirectUri: redirectUri,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      setAuthResult({
        type: 'success',
        accessToken: response.params.access_token,
      });
    } else if (response?.type === 'error') {
      setAuthResult({
        type: 'error',
        error: 'Spotify authentication failed',
      });
    }
  }, [response]);

  const authenticate = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Error during Spotify authentication:', error);
      setAuthResult({
        type: 'error',
        error: 'An error occurred during authentication',
      });
    }
  };

  return { authResult, authenticate };
}

export function getSpotifyAuthConfig() {
  return {
    clientId,
    redirectUri,
  };
}

export async function storeSpotifyToken(uid: string, accessToken: string) {
  try {
    await setDoc(doc(db, 'users', uid), {
      spotifyAccessToken: accessToken,
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error storing Spotify token:', error);
    throw 'Failed to store Spotify token.';
  }
}
