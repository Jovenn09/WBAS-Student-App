import { Alert, StyleSheet, Text, View } from "react-native";
import React, { useContext, useState } from "react";
import {
  StatusBar,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../supabase/supabaseClient";
import { AuthContext } from "../context/AuthContext";

// components
import ErrorMessage from "../components/Login/ErrorMessage";
import ForgotPassword from "../components/Login/ForgotPassword";

function validateCredential(inputs, setErrors) {
  const email = inputs.email.trim();
  const password = inputs.password;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const errors = {};

  if (!email) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(email)) {
    errors.email = "Invalid email format";
  }

  if (!password) errors.password = "Password is required";

  const isValid = Object.keys(errors).length === 0;
  if (isValid) {
    setErrors(null);
  } else {
    setErrors(errors);
  }

  return isValid;
}

export default function Login() {
  const { setUser } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const [showModal, setShowModal] = useState(false);

  async function onLoginHandler() {
    const isValid = validateCredential({ email, password }, setErrors);

    if (isValid) {
      try {
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw new Error(error.message);

        if (data.user.user_metadata?.access !== "student") {
          await supabase.auth.signOut();
          throw new Error("You are not authorize");
        }

        let { data: students, error: studentError } = await supabase
          .from("students")
          .select("student_id")
          .eq("uuid", data.user.id);

        if (studentError) throw new Error("Can't sign you in");

        setUser({ student_id: students[0].student_id, ...data.user });
      } catch (error) {
        Alert.alert("Something Went Wrong", error.message);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <View style={styles.root}>
      <View style={{ marginBottom: 12 }}>
        <Image
          style={{ width: 200, height: 200, borderRadius: 100 }}
          source={require("../assets/logo.jpg")}
        />
      </View>
      <View>
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>
          COLLEGE OF INFORMATION TECHNOLOGY
        </Text>
        <Text
          style={{ textAlign: "center", fontStyle: "italic", fontSize: 16 }}
        >
          Attendance System
        </Text>
      </View>
      <View style={{ width: "100%", marginTop: 28, gap: 18 }}>
        <View style={{ gap: 6 }}>
          <View style={styles.inputLabelContainer}>
            <Ionicons name="mail" size={20} color="#555555" />
            <Text style={styles.inputLabel}>Email</Text>
          </View>
          <TextInput
            style={styles.textInputStyle}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          {errors && errors?.email && <ErrorMessage message={errors.email} />}
        </View>
        <View style={{ gap: 6 }}>
          <View style={styles.inputLabelContainer}>
            <Ionicons name="lock-closed" size={20} color="#555555" />
            <Text style={styles.inputLabel}>Password</Text>
          </View>
          <TextInput
            secureTextEntry={true}
            style={styles.textInputStyle}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          {errors && errors?.password && (
            <ErrorMessage message={errors.password} />
          )}
        </View>
      </View>
      <View style={{ alignSelf: "flex-end", marginTop: 8 }}>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Text style={{ color: "#a88e03" }}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
      <View style={{ width: "100%", marginTop: 26 }}>
        <TouchableOpacity
          style={[styles.loginButton, loading && { backgroundColor: "grey" }]}
          onPress={onLoginHandler}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
      <ForgotPassword
        showModal={showModal}
        setShowModal={setShowModal}
        setEmail={setEmail}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: StatusBar.currentHeight + 10,
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
  },
  textInputStyle: {
    borderWidth: 2,
    fontSize: 14,
    borderRadius: 6,
    borderColor: "#ccc",
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  inputLabelContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  inputLabel: { fontSize: 15, fontWeight: "500", color: "#555555" },
  loginButton: {
    paddingVertical: 8,
    backgroundColor: "green",
    borderRadius: 4,
  },
  loginButtonText: { color: "white", textAlign: "center" },
});
