const { onRequest } = require("firebase-functions/v2/https");
const axios = require('axios');  // For API requests
// const { parseFile } = require('music-metadata');  // For duration
// const BPMDetector = require('bpm-detective');  // For BPM detection
const admin = require('firebase-admin');
admin.initializeApp();

exports.getSpotifyAudioFeatures = onRequest(
  async (req, res) => {
    const { trackId, accessToken } = req.query;

    if (!trackId || !accessToken) {
      return res.status(400).json({ error: 'Missing trackId or accessToken' });
    }

    try {
        const apiUrl = `https://api.spotify.com/v1/audio-features/${trackId}`;
        console.log('Requesting URL:', apiUrl);
    
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
    
        const audioFeatures = response.data;

        if (audioFeatures) {
          const bpm = audioFeatures.tempo;  // Spotify provides BPM as "tempo"
          const duration = audioFeatures.duration_ms / 1000;  // Duration in seconds
          
          res.status(200).json({ bpm, duration });
        } else {
          res.status(404).json({ error: 'Track not found or no audio features available' });
        }
      } catch (error) {
        console.error('Spotify API Error:', error.response ? error.response.data : error.message);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          res.status(error.response.status).json({ error: error.response.data.error.message });
        } else if (error.request) {
          // The request was made but no response was received
          res.status(503).json({ error: 'Unable to reach Spotify API' });
        } else {
          // Something happened in setting up the request that triggered an Error
          res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
  }
)
  // async (data, context) => {
  // const { trackId, accessToken } = data;  // Spotify track ID and OAuth access token
  
  // console.log('Received trackId:', trackId);
  // console.log('Access Token (first 10 chars):', accessToken.substring(0, 10) + '...');

  // try {
  //   const apiUrl = `https://api.spotify.com/v1/audio-features/${trackId}`;
  //   console.log('Requesting URL:', apiUrl);

  //   const response = await axios.get(apiUrl, {
  //     headers: {
  //       Authorization: `Bearer ${accessToken}`,
  //     },
  //   });

  //   const audioFeatures = response.data;

  //   if (audioFeatures) {
  //     const bpm = audioFeatures.tempo;  // Spotify provides BPM as "tempo"
  //     const duration = audioFeatures.duration_ms / 1000;  // Duration in seconds
  //     return { bpm, duration };
  //   } else {
  //     throw new functions.https.HttpsError('not-found', 'Track not found or no audio features available');
  //   }
  // } catch (error) {
  //   console.error('Spotify API Error:', error.response ? error.response.data : error.message);
  //   console.error('Full error object:', JSON.stringify(error, null, 2));
  //   throw new functions.https.HttpsError('invalid-argument', 'Error fetching Spotify track data', error.message);
  // }
// });

// exports.analyzeUploadedFile = functions.https.onCall(async (data, context) => {
//   const { fileUrl } = data;  // URL of the uploaded audio file (stored in Firebase Storage)
  
//   try {
//     // Step 1: Fetch the file from Firebase Storage
//     const response = await fetch(fileUrl);
//     const audioBuffer = await response.buffer();  // Read the file as a buffer

//     // Step 2: Analyze the file for duration using music-metadata
//     const metadata = await parseFile(audioBuffer);
//     const duration = metadata.format.duration;  // Duration in seconds

//     // Step 3: Detect BPM using node-bpm-detective
//     const bpm = await BPMDetector(audioBuffer);

//     return { bpm, duration };
//   } catch (error) {
//     throw new functions.https.HttpsError('unknown', error.message);
//   }
// });
