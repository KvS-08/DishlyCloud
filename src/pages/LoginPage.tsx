import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';

export const LoginPage: React.FC = () => {
  const [showRegister, setShowRegister] = useState(false);
  
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const pageTransition = {
    duration: 0.5,
    ease: "easeOut",
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-row bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-x-auto">
        {/* Left Section: Login/Register Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex items-center justify-center flex-shrink-0">
          <AnimatePresence mode="wait">
            {showRegister ? (
              <motion.div
                key="register"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
                className="w-full"
              >
                <RegisterForm onBackToLogin={() => setShowRegister(false)} />
              </motion.div>
            ) : (
              <motion.div
                key="login"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
                className="w-full"
              >
                <LoginForm onShowRegister={() => setShowRegister(true)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section: Restaurant Logos */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-10 lg:p-13 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'url(/Background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
          <div className="relative z-10 text-white text-center">
            <h2 className="text-2xl font-bold -mt-5 mb-6">Nuestra Familia</h2>
            <div className="grid grid-cols-3 gap-4">
              {/* Placeholder for restaurant logos */}
              <img src="https://via.placeholder.com/150/FF5733/FFFFFF?text=Restaurante+A" alt="Restaurante A" className="w-32 h-32 object-cover rounded-full mx-auto shadow-lg" />
              <img src="https://via.placeholder.com/150/33FF57/FFFFFF?text=Restaurante+B" alt="Restaurante B" className="w-32 h-32 object-cover rounded-full mx-auto shadow-lg" />
              <img src="https://via.placeholder.com/150/3357FF/FFFFFF?text=Restaurante+C" alt="Restaurante C" className="w-32 h-32 object-cover rounded-full mx-auto shadow-lg" />
              <img src="https://via.placeholder.com/150/FF33FF/FFFFFF?text=Restaurante+D" alt="Restaurante D" className="w-32 h-32 object-cover rounded-full mx-auto shadow-lg" />
            </div>

          </div>
        </div>
      </div>
  );
};