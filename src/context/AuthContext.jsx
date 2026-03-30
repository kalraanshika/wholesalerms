import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();


const API_URL = import.meta.env.VITE_API_URL ;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem("wmsUser");
    const token = localStorage.getItem("wmsToken");
    if (userInfo && token) {
      setUser(JSON.parse(userInfo));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(API_URL + "/auth/login", { email, password });
      if (res.data) {
        localStorage.setItem("wmsUser", JSON.stringify(res.data));
        localStorage.setItem("wmsToken", res.data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        setUser(res.data);
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post(API_URL + "/auth/register", { name, email, password });
      if (res.data) {
        localStorage.setItem("wmsUser", JSON.stringify(res.data));
        localStorage.setItem("wmsToken", res.data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        setUser(res.data);
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("wmsUser");
    localStorage.removeItem("wmsToken");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { AuthContext };
