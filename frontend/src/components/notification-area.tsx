import React from 'react';
import NotificationCard from './notification-card';
import { useNotification } from '../providers/notification-provider';

const NotificationArea: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed bottom-4 right-4 max-w-xs z-50">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationArea;