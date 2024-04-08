import {
  Button,
  Modal,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../supabase/supabaseClient";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function ForgotPassword({ showModal, setShowModal }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSendEmailResetPassword() {
    try {
      setLoading(true);

      if (!email || !emailRegex.test(email)) {
        throw new Error("Invalid Email");
      }

      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw new Error(error.message);

      setShowModal(false);
      Alert.alert("Success!", "Please check your email to reset your password");
      setEmail("");
    } catch (error) {
      Alert.alert("Can't send an email", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal animationType="fade" visible={showModal} transparent={true}>
      <View
        onTouchEnd={() => setShowModal(false)}
        style={styles.modalOverlay}
      ></View>
      <View pointerEvents="box-none" style={styles.centeredView}>
        <View style={styles.sendEmailContainer}>
          <View style={{ gap: 6 }}>
            <View style={styles.inputLabelContainer}>
              <Ionicons name="mail" size={20} color="#555555" />
              <Text style={styles.inputLabel}>Email</Text>
            </View>
            <TextInput
              style={styles.textInputStyle}
              value={email}
              onChangeText={(value) => setEmail(value.trim())}
              autoCapitalize="none"
              placeholder="Enter your email"
            />
          </View>
          <Button
            title={loading ? "Sending..." : "Send"}
            onPress={onSendEmailResetPassword}
            disabled={loading}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    backgroundColor: "black",
    top: 0,
    bottom: 0,
    flex: 1,
    width: "100%",
    opacity: 0.3,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  sendEmailContainer: {
    backgroundColor: "white",
    width: "80%",
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  inputLabelContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  inputLabel: { fontSize: 15, fontWeight: "500", color: "#555555" },
  textInputStyle: {
    borderWidth: 2,
    fontSize: 14,
    borderRadius: 6,
    borderColor: "#ccc",
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
});
