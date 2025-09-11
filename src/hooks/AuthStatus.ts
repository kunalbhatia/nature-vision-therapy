import { useEffect, useState } from 'react';

const useAuthStatus = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setIsLoggedIn(data.isLoggedIn || false);
        setUser(data.user || null);
      });
  }, []);

  return { isLoggedIn, user };
};

export default useAuthStatus;
