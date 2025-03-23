// frontend/src/components/notification-card.tsx
import React from 'react';

interface NotificationCardProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ message, type, onClose }) => {
  let bgColor = '';
  let textColor = '';
  let borderColor = '';

  switch (type) {
    case 'success':
      bgColor = 'bg-ashley-accent-1'; // Light green
      textColor = 'text-ashley-accent-12'; // Dark green
      borderColor = 'border-ashley-accent-9'; // Medium green
      break;
    case 'error':
      bgColor = 'bg-ashley-gray-1'; // Light gray (using for error for now)
      textColor = 'text-ashley-gray-12'; // Dark gray
      borderColor = 'border-ashley-gray-9'; // Medium gray
      break;
    case 'info':
      bgColor = 'bg-ashley-gray-3'; // Light blue/gray
      textColor = 'text-ashley-gray-12'; // Dark gray
      borderColor = 'border-ashley-gray-7'; // Medium gray
      break;
    default:
      bgColor = 'bg-ashley-gray-1';
      textColor = 'text-ashley-gray-12';
      borderColor = 'border-ashley-gray-6';
  }

  return (
    <div className={`rounded-md ${bgColor} ${borderColor} border p-4 mb-4 flex justify-between items-center`}>
      <p className={textColor}>{message}</p>
      <button onClick={onClose} className="text-ashley-gray-11 hover:text-ashley-gray-12">
        ×
      </button>
    </div>
  );
};

export default NotificationCard;
