import { useState, useEffect } from 'react';

// This comment is added to force re-compilation

const backgroundImages = [
  '/login-backgrounds/Background-Bakery-A.jpg',
  '/login-backgrounds/Background-Burger-A.jpg',
  '/login-backgrounds/Background-Burger-B.jpg',
  '/login-backgrounds/Background-Burger-C.jpg',
  '/login-backgrounds/Background-Burger-D.jpg',
  '/login-backgrounds/Background-Burger-E.jpg',
  '/login-backgrounds/Background-Coffeeshop-A.jpg',
  '/login-backgrounds/Background-Coffeeshop-B.jpg',
  '/login-backgrounds/Background-Coffeeshop-C.jpg',
  '/login-backgrounds/Background-Coffeeshop-D.jpg',
  '/login-backgrounds/Background-Coffeeshop-E.jpg',
  '/login-backgrounds/Background-Pizza-A.jpg',
   '/login-backgrounds/Background-Pizza-B.jpg',
   '/login-backgrounds/Background-Pizza-C.jpg',
   '/login-backgrounds/Background-Pizza-D.jpg',
   '/login-backgrounds/Background-Pizza-E.jpg',
   '/login-backgrounds/Background-Taco-A.jpg',
];

export const useRandomBackground = () => {
  const [randomBackground, setRandomBackground] = useState('');
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const preloadImages = () => {
      const imagePromises = backgroundImages.map((src) => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve();
          img.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            resolve(); // Resolve even on error to not block other images
          };
        });
      });

      Promise.all(imagePromises).then(() => {
        setImagesLoaded(true);
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        setRandomBackground(backgroundImages[randomIndex]);
      });
    };

    preloadImages();
  }, []);

  return imagesLoaded ? randomBackground : '';

  return randomBackground;
};