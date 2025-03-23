import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login as loginApi, refreshToken as refreshTokenApi } from "../api/auth";
import { useSessionStorage } from "../hooks/useSessionStorage";

interface AuthContextProps {
  isAuthenticated: boolean;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  userEmail: string | null;
  authToken: string | null;
  refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [userEmail, setUserEmail] = useSessionStorage<string | null>(
    "user_email",
    null
  );
  const [accessToken, setAccessToken] = useSessionStorage<string | null>(
    "access_token",
    null
  );
  const [refreshToken, setRefreshToken] = useSessionStorage<string | null>(
    "refresh_token",
    null
  );

  const login = async (username: string, password: string) => {
    try {
      const response = await loginApi(username, password);
      setAccessToken(response.access_token);
      setRefreshToken(response.refresh_token);
      setUserEmail(username);
      setIsAuthenticated(true);
      const origin = location.state?.from?.pathname || "/";
      navigate(origin);
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAccessToken(null);
    setRefreshToken(null);
    setUserEmail(null);
    navigate("/", { replace: true });
  };

  const refreshAccessToken = async () => {
    if (!refreshToken || !accessToken) {
      setIsAuthenticated(false);
      navigate("/login");
      return;
    }

    try {
      const response = await refreshTokenApi(refreshToken, accessToken);
      setAccessToken(response.access_token);
      setRefreshToken(response.refresh_token)
      setIsAuthenticated(true);

    }
    catch (error) {
      setIsAuthenticated(false);
      setAccessToken(null);
      setRefreshToken(null);
      setUserEmail(null);
      navigate("/login");
      throw error;
    }
  }

  useEffect(() => {
    if (accessToken) {
      setIsAuthenticated(true);
    }
  }, [accessToken]);

  useEffect(() => {
    // Refresh the access token every 4 minutes
    const refreshInterval = setInterval(() => {
      if (isAuthenticated && refreshToken && accessToken) {
        refreshAccessToken();
      }
    }, 4 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, refreshToken, accessToken]);

  const contextValue: AuthContextProps = {
    isAuthenticated,
    setIsAuthenticated,
    login,
    logout,
    userEmail,
    authToken: accessToken,
    refreshAccessToken,
  };

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
