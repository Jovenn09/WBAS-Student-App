import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";

const options = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "History",
  "Geography",
  "English Literature",
  "Art",
  "Physical Education",
];

export default function SelectModal({
  showModal,
  setShowModal,
  setSelectedSubject,
  subjects,
}) {
  function onSelect(value) {
    let selectedValue = value;

    setShowModal(false);
    setSelectedSubject(selectedValue);
  }
  return (
    <Modal animationType="fade" visible={showModal} transparent={true}>
      <View
        onTouchEnd={() => setShowModal(false)}
        style={styles.modalOverlay}
      ></View>
      <View pointerEvents="box-none" style={styles.centeredView}>
        <View style={styles.selectContainer}>
          <ScrollView>
            {subjects.map((data) => (
              <Pressable
                style={{
                  marginVertical: 4,
                  paddingVertical: 8,
                  paddingHorizontal: 4,
                  marginHorizontal: 4,
                }}
                android_ripple={{ color: "black" }}
                key={data.id}
                onPress={() => onSelect(data.id)}
              >
                <Text>{data.description}</Text>
              </Pressable>
            ))}
          </ScrollView>
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
    opacity: 0.5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  selectContainer: {
    backgroundColor: "white",
    width: "60%",
    maxHeight: 400,
    borderRadius: 8,
  },
});
