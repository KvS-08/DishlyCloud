import { useRef, useEffect } from 'react';

export const useSound = (soundPath: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(soundPath);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundPath]);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Rewind to the start
      audioRef.current.play().catch(error => console.error("Error playing sound:", error));
    }
  };

  return playSound;
};