import React, { useState } from 'react';
import { TouchableOpacity, Image, View, Text, StyleSheet } from 'react-native';
import { RNCamera } from 'react-native-camera';
import axios from 'axios';
import { Buffer } from 'buffer';
import Tts from 'react-native-tts';
import { LogBox } from 'react-native';


LogBox.ignoreLogs(['new NativeEventEmitter']);


const App = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null);

  const takePicture = async (camera: RNCamera) => {
    const options = { quality: 0.5, base64: true };
    const data = await camera.takePictureAsync(options);
    setPhoto(data.uri);
    const image = data.base64;
    const buffer = Buffer.from(image, 'base64');
    try {
      const azureVisionResponse = await axios.post(
        'https://eastus.api.cognitive.microsoft.com/vision/v3.0/analyze?visualFeatures=Description&language=en',
        buffer,
        {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': ''
          }
        }
      );
      const newCaption = azureVisionResponse.data.description.captions[0].text;
      setCaption(newCaption);
      Tts.speak(newCaption); // Hacer que la aplicación hable el contenido del título
    } catch (error) {
      setCaption("No avalibe to analyze the image");
      Tts.speak("No avalibe to analyze the image");
    }
  };  

  return (
    <View style={styles.container}>
      {caption && <Text style={styles.caption}>{caption}</Text>}
      {photo && <Image style={styles.preview} source={{ uri: photo }} />}
      <RNCamera
        style={styles.camera}
        type={RNCamera.Constants.Type.back}
        captureAudio={false}
      >
        {({ camera, status }) => {
          if (status !== 'READY') return <View />;
          return (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.capture} onPress={() => takePicture(camera)} />
            </View>
          );
        }}
      </RNCamera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  preview: {
    width: '100%',
    height: '30%',
    resizeMode: 'contain',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  capture: {
    backgroundColor: '#fff',
    borderRadius: 50,
    height: 70,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  caption: {
    fontSize: 18,
    textAlign: 'center',
    padding: 10,
  },
});

export default App;
