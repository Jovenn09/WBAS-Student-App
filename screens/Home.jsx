import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Entypo } from "@expo/vector-icons";
import { format } from "date-fns";
import { supabase } from "../supabase/supabaseClient";
import { AuthContext } from "../context/AuthContext";

// components
import AttendanceCard from "../components/home/AttendanceCard";
import SelectModal from "../components/home/SelectModal";

const numOfLoadItem = 6;

export default function Home() {
  const { user } = useContext(AuthContext);
  const [name, setName] = useState("");

  const [attendanceRecord, setAttendanceRecord] = useState([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [date, setDate] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [refresh, setRefresh] = useState(0);

  const [numOfLoad, setNumOfLoad] = useState(0);
  const [numOfItem, setNumOfItem] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isReachEnd, setIsReachEnd] = useState(false);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [subjectTotalAttendance, setSubjectTotalAttendance] = useState([]);
  const [totalAbsences, setTotalAbsences] = useState(0);

  function onChangeDateHandler(event, selectedDate, isStart) {
    if (isStart) {
      setShowDatePicker(false);
      if (event.type === "set") {
        setStartDate(selectedDate);
      }
    } else {
      setShowEndDatePicker(false);
      if (event.type === "set") {
        setEndDate(selectedDate);
      }
    }
  }

  function onDatePressHandler(isStart) {
    if (isStart) setShowDatePicker(true);
    else setShowEndDatePicker(true);
  }

  async function onReachEndHandler() {
    let query = supabase
      .from("attendance")
      .select(
        `
    subject_id,
    subjects (
      subject_description
    ),
    date
    `,
        { count: "exact" }
      )
      .eq("student_id", user.student_id)
      .eq("attendance_status", "absent")
      .order("timestamp", { ascending: false });

    const numOfFetch = numOfLoad + 1;
    const numOfPage = Math.ceil(numOfItem / numOfLoadItem);

    if (numOfFetch >= numOfPage) return;

    setIsReachEnd(true);

    const start = numOfFetch * numOfLoadItem;
    const end = (numOfFetch + 1) * numOfLoadItem;

    query.ilike("subject_id", `%${selectedSubject}%`);
    if (endDate && startDate) {
      query
        .lte("date", format(endDate, "yyyy-MM-dd"))
        .gte("date", format(startDate, "yyyy-MM-dd"));
    }
    query.range(start, end);

    const { data, error } = await query;

    if (!error && data.length > 0) {
      setAttendanceRecord((prev) => prev.concat(data));
      setNumOfLoad((prev) => prev + 1);
    }
    setIsReachEnd(false);
  }

  async function getAttendance() {
    try {
      setIsLoading(true);
      setNumOfLoad(0);

      let query = supabase
        .from("attendance")
        .select(
          `
    subject_id,
    subjects (
      subject_description
    ),
    date
    `,
          { count: "exact" }
        )
        .order("timestamp", { ascending: false })
        .eq("attendance_status", "absent")
        .eq("student_id", user.student_id)
        .ilike("subject_id", `%${selectedSubject}%`)
        .range(0, 5);

      if (endDate && startDate)
        query
          .lte("date", format(endDate, "yyyy-MM-dd"))
          .gte("date", format(startDate, "yyyy-MM-dd"));

      const { data, error, count } = await query;

      if (error) throw new Error(error.message);

      setAttendanceRecord(data);
      setNumOfItem(count);
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function getSubjects() {
    const { data, error } = await supabase
      .from("attendance")
      .select(
        `
      subject_id,
      subjects (
      subject_description
      )
      `
      )
      .eq("student_id", user.student_id);

    if (error) return console.log(error);

    const subjects = data
      .filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.subject_id === item.subject_id)
      )
      .map((data) => ({
        description: data.subjects.subject_description,
        id: data.subject_id,
      }));

    setSubjects(subjects);
  }

  useEffect(() => {
    const channels = supabase
      .channel("custom-filter-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "attendance",
          filter: `student_id=eq.${user.student_id}`,
        },
        (payload) => {
          setRefresh((prev) => prev + 1);
        }
      )
      .subscribe();
  }, []);

  useEffect(() => {
    getSubjects();
  }, []);

  useEffect(() => {
    getAttendance();
  }, [selectedSubject, refresh]);

  useEffect(() => {
    if (startDate && endDate) {
      getAttendance();
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const getStudentName = async () => {
      const { data, error } = await supabase
        .from("students")
        .select("name")
        .eq("uuid", user.id);

      if (error) console.log(error);

      const name = data[0]?.name || "";
      setName(name);
    };
    getStudentName();
  }, []);

  async function checkAttendanceNumber() {
    const { count } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("attendance_status", "absent")
      .eq("student_id", user.student_id);
    if (count > 2) {
      ToastAndroid.show(
        "You have already 3 absences. Please take note of your attendance",
        ToastAndroid.LONG
      );
    }
  }

  useEffect(() => {
    checkAttendanceNumber();
  }, []);

  async function getTotalAbsentsBySubject() {
    const { count } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("student_id", user.student_id);

    setTotalAbsences(count);

    const data = await Promise.all(
      subjects.map(async (item) => {
        const { count } = await supabase
          .from("attendance")
          .select("*", { count: "exact", head: true })
          .eq("subject_id", item.id)
          .eq("student_id", user.student_id);

        return {
          count,
          name: `${item.description}`,
        };
      })
    );

    setSubjectTotalAttendance(data);
  }

  useEffect(() => {
    if (!subjects.length) return;
    getTotalAbsentsBySubject();
  }, [subjects]);

  return (
    <View>
      <Text
        style={{
          textAlign: "center",
          fontSize: 32,
          fontWeight: "bold",
          marginTop: 16,
          marginBottom: 8,
        }}
      >
        Welcome
      </Text>
      <Text
        style={{ textAlign: "center", fontWeight: "500", marginBottom: 16 }}
      >
        {name}
      </Text>
      <View
        style={{
          justifyContent: "center",
          gap: 18,
          marginVertical: 8,
          flexWrap: "wrap",
          alignSelf: "center",
        }}
      >
        <View style={{ flexDirection: "row", gap: 16 }}>
          <View style={styles.filterBtnContainer}>
            <Text style={styles.filterBtnText}>Start Date:</Text>
            <Pressable
              style={styles.filterBtn}
              onPress={onDatePressHandler.bind(this, true)}
            >
              <Text>
                {startDate ? format(startDate, "dd/MM/yyyy") : "dd/mm/yyyy"}
              </Text>
              <Entypo name="calendar" size={20} color="black" />
            </Pressable>
          </View>
          <View style={styles.filterBtnContainer}>
            <Text style={styles.filterBtnText}>End Date:</Text>
            <Pressable
              style={styles.filterBtn}
              onPress={onDatePressHandler.bind(this, false)}
            >
              <Text>
                {endDate ? format(endDate, "dd/MM/yyyy") : "dd/mm/yyyy"}
              </Text>
              <Entypo name="calendar" size={20} color="black" />
            </Pressable>
          </View>
        </View>

        <View style={styles.filterBtnContainer}>
          <Text style={styles.filterBtnText}>Filter by Subject</Text>
          <Pressable
            style={styles.filterBtn}
            onPress={() => setShowModal(true)}
          >
            <Text>{selectedSubject || "Select subject"}</Text>
          </Pressable>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => {
          setSelectedSubject("");
          setStartDate(null);
          setEndDate(null);
          setRefresh((prev) => prev++);
        }}
        style={styles.clearFilterBtn}
      >
        <Text style={{ color: "white" }}>Clear Filter</Text>
      </TouchableOpacity>
      <View>
        <Text
          style={{
            textAlign: "center",
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 16,
          }}
        >
          Personal Attendance Report
        </Text>
        <View
          style={{
            width: "90%",
            alignSelf: "center",
            backgroundColor: "white",
            marginBottom: 24,
            padding: 24,
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 18 }}>
            Absent Summary
          </Text>
          <Text>Total Absences: {totalAbsences}</Text>
          <View
            style={{ borderWidth: 0.5, marginVertical: 8, opacity: 0.1 }}
          ></View>
          {subjectTotalAttendance.map(({ count, name }, index) => (
            <View key={index} style={{ flexDirection: "row", gap: 8 }}>
              <Text>{name}:</Text>
              <Text style={{ fontWeight: "bold" }}>{count}</Text>
            </View>
          ))}
        </View>
        {!isLoading && (
          <FlatList
            style={{ height: 450 }}
            data={attendanceRecord}
            renderItem={({ item }) => (
              <AttendanceCard
                subject={`${item.subject_id} - ${item.subjects.subject_description}`}
                date={item.date}
              />
            )}
            keyExtractor={(item, index) => index + item.subject_id}
            onEndReached={onReachEndHandler}
          />
        )}
        {(isLoading || isReachEnd) && (
          <ActivityIndicator color="black" size="small" />
        )}
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={(e, v) => onChangeDateHandler(e, v, true)}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={(e, v) => onChangeDateHandler(e, v, false)}
        />
      )}
      <SelectModal
        showModal={showModal}
        setShowModal={setShowModal}
        setSelectedSubject={setSelectedSubject}
        subjects={subjects}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filterBtnContainer: { flexDirection: "column", alignItems: "center", gap: 6 },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    padding: 4,
  },
  filterBtnText: { fontSize: 16, fontWeight: "500" },
  clearFilterBtn: {
    backgroundColor: "#a88e03",
    alignSelf: "center",
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 4,
    marginVertical: 18,
  },
});
