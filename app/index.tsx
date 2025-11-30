import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {
  function handleNext(){
    router.push('/chat')
  }
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.logoText}>LOGO</Text>
      </View>

      <View style={styles.descContainer}>
        <Text style={styles.descText}>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </Text>
      </View>

      <Pressable style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Begin</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#020617",
    justifyContent: "space-around",
    alignItems: "center",
  },
  logoText: {
    fontSize: 54,
    color: "#38bdf8",
    fontWeight: "900",
    letterSpacing: 2,
  },
  descContainer: {
    paddingHorizontal: 10,
  },
  descText: {
    color: "#cbd5f5",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#020617",
    fontSize: 16,
    fontWeight: "bold",
  },
});