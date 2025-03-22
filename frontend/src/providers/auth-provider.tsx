import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface AuthContextProps {
  isAuthenticated: boolean;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  login: () => void;  // Placeholder for login function
  logout: () => void; // Placeholder for logout function
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const login = () => {
    // Placeholder: Replace with actual login logic (e.g., API call)
    setIsAuthenticated(true);

    const origin = location.state?.from?.pathname || '/';
    navigate(origin);
  };

  const logout = () => {
    // Placeholder: Replace with actual logout logic (e.g., clearing tokens)
    setIsAuthenticated(false);
    navigate("/", { replace: true });
  };

  const contextValue: AuthContextProps = {
    isAuthenticated,
    setIsAuthenticated,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};