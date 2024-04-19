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

      if (data.user?.user_metadata?.access === "student") {
        let { data: students, error: studentError } = await supabase
          .from("students")
          .select("student_id")
          .eq("uuid", data.user.id);

        if (studentError) console.log(error.message);

        setUser({ student_id: students[0].student_id, ...data.user });
      } else {
        setUser(data.user);
      }

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
