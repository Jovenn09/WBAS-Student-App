import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hqrqchwtvmlfvcvigeol.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxcnFjaHd0dm1sZnZjdmlnZW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEwODkzODQsImV4cCI6MjAyNjY2NTM4NH0.dnEqiJ8YZvg3BjGKaQM7Jekjsy8zhOoLfV8DhmP-ebE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
