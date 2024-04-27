import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [filled, setFilled] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onConfirmPassword() {
    setLoading(true);

    try {
      if (newPassword !== confirmPassword)
        throw new Error("Password does not match");

      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (error) throw new Error(error.message);

      const { data: newData, error: newError } = await supabase.auth.updateUser(
        {
          password: newPassword,
        }
      );

      if (newError) throw new Error(newError.message);

      setUser(newData.user);
      Alert.alert(
        "Password Changed!",
        "You have successfully changed your password"
      );

      setConfirmPassword("");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      Alert.alert("Something went wrong", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (currentPassword && newPassword && confirmPassword) {
      setFilled(true);
    } else {
      setFilled(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  return (
    <View style={{ width: "90%", marginTop: 28, gap: 18, alignSelf: "center" }}>
      <View style={{ gap: 6 }}>
        <View style={styles.inputLabelContainer}>
          <Text style={styles.inputLabel}>Current Password</Text>
        </View>
        <TextInput
          secureTextEntry={true}
          style={styles.textInputStyle}
          onChangeText={setCurrentPassword}
          autoCapitalize="none"
        />
      </View>
      <View style={{ gap: 6 }}>
        <View style={styles.inputLabelContainer}>
          <Text style={styles.inputLabel}>New Password</Text>
        </View>
        <TextInput
          secureTextEntry={true}
          style={styles.textInputStyle}
          onChangeText={setNewPassword}
          autoCapitalize="none"
        />
      </View>
      <View style={{ gap: 6 }}>
        <View style={styles.inputLabelContainer}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
        </View>
        <TextInput
          secureTextEntry={true}
          style={styles.textInputStyle}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
        />
      </View>
      <TouchableOpacity
        style={[
          styles.changePasswordBtn,
          !filled && !loading && { backgroundColor: "#e5e5e5" },
        ]}
        onPress={onConfirmPassword}
        disabled={!filled}
      >
        {loading ? (
          <ActivityIndicator color="black" size="small" />
        ) : (
          <Text
            style={[
              { color: "white" },
              !filled && !loading && { color: "#c2c2c2" },
            ]}
          >
            Change password
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  disabledStyle: {
    backgroundColor: "#e5e5e5",
    color: "#c2c2c2",
  },
  changePasswordBtn: {
    backgroundColor: "#a88e03",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 4,
  },
});
