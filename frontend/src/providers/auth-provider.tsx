import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api/auth'; // Import login function from api/auth.ts
import { useSessionStorage } from '../hooks/useSessionStorage'; // Import useSessionStorage hook

interface AuthContextProps {
  isAuthenticated: boolean;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  userEmail: string | null;
  authToken: string | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [userEmail, setUserEmail] = useSessionStorage<string | null>('user_email', null);
  const [token, setToken] = useSessionStorage<string | null>('jwt_token', null);

  const login = async (username: string, password: string) => {
    try {
      const token = await loginApi(username, password);
      setToken(token);
      setUserEmail(username); // Assuming username is email for now
      setIsAuthenticated(true);
      const origin = location.state?.from?.pathname || '/';
      navigate(origin);
    } catch (error) {
      setIsAuthenticated(false); // Login failed, set isAuthenticated to false
      throw error;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setUserEmail(null);
    navigate("/", { replace: true });
  };

  // Check for token on component mount to persist login state
  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      const origin = location.pathname || '/';
      navigate(origin);
    }
  }, []);

  const contextValue: AuthContextProps = {
    isAuthenticated,
    setIsAuthenticated,
    login,
    logout,
    userEmail,
    authToken: token
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
