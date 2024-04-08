import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function ErrorMessage({ message }) {
  return (
    <View style={styles.errorContainer}>
      <MaterialIcons name="error" size={18} color="red" />
      <Text style={{ color: "red" }}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
});
