import { useEffect, useRef } from 'react';

interface CameraViewportProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onError: (error: string) => void;
  className?: string;
}

export const CameraViewport = ({ videoRef, onError, className = '' }: CameraViewportProps) => {
  const videoElementRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoElementRef.current) {
          videoElementRef.current.srcObject = stream;
          videoElementRef.current.play().catch(e => {
            console.error('Error playing video:', e);
            onError('Failed to play video stream');
          });
        }

        // Also set the passed ref for parent component access
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => {
            console.error('Error playing video on passed ref:', e);
          });
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        let errorMessage = 'Unable to access camera';
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use';
        }
        onError(errorMessage);
      }
    };

    startVideo();

    // Cleanup
    return () => {
      if (videoElementRef.current) {
        const stream = videoElementRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        videoElementRef.current.srcObject = null;
      }

      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        videoRef.current.srcObject = null;
      }
    };
  }, [onError, videoRef]);

  return (
    <video
      ref={videoElementRef}
      autoPlay
      playsInline
      muted
      className={`object-cover w-full h-full ${className}`}
    />
  );
};