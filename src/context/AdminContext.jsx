import { createContext, useContext, useState, useCallback } from 'react';

const AdminContext = createContext(null);

// 密码 SHA-256 哈希
const PASSWORD_HASH = '2a006b3e9b18c6efb98056af15a6d6436b0c23489fcc56409118d9c09da9b7ae';

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('admin') === 'true');

  const login = useCallback(async (password) => {
    const hash = await sha256(password);
    if (hash === PASSWORD_HASH) {
      sessionStorage.setItem('admin', 'true');
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('admin');
    setIsAdmin(false);
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
