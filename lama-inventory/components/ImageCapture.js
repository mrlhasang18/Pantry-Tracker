'use client'
import React, { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { Button, Box, Typography, CircularProgress } from '@mui/material';

const ImageCapture = ({ onItemDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
      setIsLoading(false);
    };
    loadModel();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setIsCameraOn(true);
    } catch (error) {
      console.error("Error starting camera:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    }
  };

  const captureImage = async () => {
    if (!isCameraOn) {
      console.error("Camera is not on");
      return;
    }

    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 640, 480);
    const imageData = context.getImageData(0, 0, 640, 480);
    
    if (model) {
      const predictions = await model.detect(imageData);
      if (predictions.length > 0) {
        const item = predictions[0].class;
        onItemDetected(item);
        stopCamera();
      } else {
        console.log("No objects detected");
      }
    } else {
      console.error("Model not loaded yet");
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <video ref={videoRef} width="640" height="480" autoPlay style={{ display: isCameraOn ? 'block' : 'none' }} />
      <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />
      {!isCameraOn ? (
        <Button variant="contained" onClick={startCamera}>Start Camera</Button>
      ) : (
        <>
          <Button variant="contained" onClick={captureImage}>Capture and Detect</Button>
          <Button variant="outlined" onClick={stopCamera}>Stop Camera</Button>
        </>
      )}
      <Typography variant="body2">
        Note: Make sure to allow camera access when prompted.
      </Typography>
    </Box>
  );
};

export default ImageCapture;