import React from 'react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, url, title }) => {
  if (!isOpen) return null;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[101]" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-sm w-full m-4 text-center" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-text-secondary mb-6 text-sm">Scan the QR code with your phone to view the transaction on HashScan.</p>
        {url ? (
            <img src={qrCodeUrl} alt="QR Code for HashScan link" className="mx-auto rounded-lg border-4 border-gray-200" />
        ) : (
            <p className="text-red-500">Transaction URL not available.</p>
        )}
         <p className="text-xs text-gray-400 mt-4 break-all">{url}</p>
        <button onClick={onClose} className="mt-6 w-full px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors">
          Close
        </button>
      </div>
    </div>
  );
};

export default QrCodeModal;
