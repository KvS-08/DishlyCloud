import { FaTimes } from 'react-icons/fa';
import Portal from '../ui/Portal';
import QRCode from 'react-qr-code';
import { Link } from 'react-router-dom';
import React, { useState, useEffect, memo } from 'react';

interface MenuQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuQRModal: React.FC<MenuQRModalProps> = ({ isOpen, onClose }) => {
  const [showModal, setShowModal] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setAnimateOut(false);
    } else {
      setAnimateOut(true);
      const timer = setTimeout(() => setShowModal(false), 300); // Duration of modal-slide-out animation
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!showModal) return null;

  const modalClassName = `modal-content-qr ${animateOut ? 'modal-slide-out' : 'modal-slide-in'}`;

  return (
    <Portal>
      <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className={`${modalClassName} bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative`}>
            <button
            className="modal-close-button absolute top-3 right-3 text-gray-500 hover:text-red-500"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <FaTimes />
          </button>
          <div className="flex flex-col justify-center h-full p-2">
            <Link
              to="/menu-qr"
              className="text-white text-xl font-bold mb-4 hover:underline text-left w-full"
            >
              Ir al Menu QR
            </Link>
            <QRCode value="https://example.com/menu" size={192} level="H" />
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default memo(MenuQRModal);