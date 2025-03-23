import { useNotification } from '../providers/notification-provider';

const useErrorNotifier = () => {
  const { addNotification } = useNotification();

  const reportError = (operation: string, error: any) => {
    if (error instanceof Error) {
      addNotification(`Failed to ${operation}: ${error.message}`, 'error');
    } else {
      addNotification(`Failed to ${operation}`, 'error');
    }
    console.error(`Error during ${operation}:`, error);
  };

  return { reportError };
};

export default useErrorNotifier;
