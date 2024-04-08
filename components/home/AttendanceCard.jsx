import { StyleSheet, Text, View, ScrollView } from "react-native";
import React from "react";

export default function AttendanceCard({ subject, date }) {
  return (
    <View style={styles.cardContainer}>
      <View style={{ flexDirection: "row", gap: 4 }}>
        <Text style={{ fontWeight: "bold" }}>Subject:</Text>
        <ScrollView horizontal>
          <Text>{subject}</Text>
        </ScrollView>
      </View>
      <View style={{ flexDirection: "row", gap: 4 }}>
        <Text style={{ fontWeight: "bold" }}>Date:</Text>
        <Text>{date}</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 4 }}>
        <Text style={{ fontWeight: "bold" }}>Status:</Text>
        <Text>Absent</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    alignSelf: "center",
    width: "90%",
    gap: 8,
    padding: 8,
    backgroundColor: "white",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1.0,
    elevation: 1,
    marginBottom: 10,
  },
});
