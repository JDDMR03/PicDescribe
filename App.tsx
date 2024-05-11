import React, { useState } from 'react';
import { Button, Image, View } from 'react-native';
import { RNCamera } from 'react-native-camera';
import axios from 'axios';
import { Buffer } from 'buffer';


const App = () => {
  const [photo, setPhoto] = useState<string | null>(null);

  const takePicture = async (camera: RNCamera) => {
    const options = { quality: 0.5, base64: true };
    const data = await camera.takePictureAsync(options);
    setPhoto(data.uri);
    const image = data.base64;
    const buffer = Buffer.from(image, 'base64');
    const azureVisionResponse = await axios.post(
        'https://eastus.api.cognitive.microsoft.com/vision/v3.0/analyze?visualFeatures=Description&language=es',
        buffer,
        {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': ''
          }
        }
      );
    console.log(azureVisionResponse.data.description.captions[0].text);
  };

  return (
    <View style={{ flex: 1 }}>
      {photo && <Image style={{ flex: 1 }} source={{ uri: photo }} />}
      <RNCamera
        style={{ flex: 1 }}
        type={RNCamera.Constants.Type.back}
        captureAudio={false}
      >
        {({ camera, status }) => {
          if (status !== 'READY') return <View />;
          return (
            <View>
              <Button title="Tomar foto" onPress={() => takePicture(camera)} />
            </View>
          );
        }}
      </RNCamera>
    </View>
  );
};

export default App;

