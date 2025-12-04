import { logo } from "@/assets";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {
  function handleNext(){
    router.push('/chat')
  }
  return (
    <View style={styles.container}>
      <Image
        source={logo} // <-- update filename if needed
        style={styles.logo}
        resizeMode="contain"
      />
      <View>
        <Text style={styles.logoText}>EchoMood</Text>
      </View>

      <View style={styles.descContainer}>
        <Text style={styles.descText}>
          Every post has a mood. EchoMood gives it a voice. AI-powered music, generated just for you
          — instantly, on your device.
        </Text>
      </View>

      <Pressable style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Begin Your Soundtrack</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 160,
    height: 160,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F2FF",
    justifyContent: "space-around",
    alignItems: "center",
  },
  logoText: {
    fontSize: 37,
    color: "#1B2449",
    fontWeight: "900",
    letterSpacing: 2,
  },
  descContainer: {
    paddingHorizontal: 10,
  },
  descText: {
    color: "#1B2449",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FF7B9C",
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#1B2449",
    fontSize: 16,
    fontWeight: "bold",
  },
});
