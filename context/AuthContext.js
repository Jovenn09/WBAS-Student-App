import { createContext, useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
});

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.log(error.message);
      setUser(data.user);
      setLoading(false);
    };
    getSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
