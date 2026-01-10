import { useState, useRef } from 'react';

interface CameraOptions {
  width?: number;
  height?: number;
  quality?: number;
}

export function useCamera() {
  const [isOpen, setIsOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsOpen(true);
        setError(null);
      }
    } catch (err: any) {
      setError('Camera access denied or not available');
    }
  };

  const capturePhoto = (options: CameraOptions = {}) => {
    if (!videoRef.current || !canvasRef.current) return null;

    const { width = 640, height = 480, quality = 0.8 } = options;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const photoData = canvas.toDataURL('image/jpeg', quality);
      setPhoto(photoData);
      return photoData;
    }
    return null;
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsOpen(false);
  };

  const uploadFromGallery = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPhoto(result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return {
    isOpen,
    photo,
    error,
    videoRef,
    canvasRef,
    openCamera,
    capturePhoto,
    closeCamera,
    uploadFromGallery,
    clearPhoto: () => setPhoto(null)
  };
}