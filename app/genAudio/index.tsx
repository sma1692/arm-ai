

import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View, } from "react-native";
import { AudioGen } from "../../mod/AudioGen";

type OptionKey = "option1" | "option2" | "option3";

type OptionState = {
  loading: boolean;
  uri: string | null;
};

export default function AudioGenOptions() {
  const { originalPrompt,h1 , h2 , h3, option1, option2, option3 } =
    useLocalSearchParams<{
      originalPrompt: string;
      h1:string;
      h2:string;
      h3:string;
      option1: string;
      option2: string;
      option3: string;
    }>();

  const [options, setOptions] = useState<
    Record<OptionKey, OptionState>
  >({
    option1: { loading: false, uri: null },
    option2: { loading: false, uri: null },
    option3: { loading: false, uri: null },
  });

  const generate = async (key: OptionKey, prompt: string) => {
    if (!prompt) return;

    setOptions((prev) => ({
      ...prev,
      [key]: { loading: true, uri: null },
    }));

    try {
      const uri = await AudioGen.generate(prompt, 10);
      setOptions((prev) => ({
        ...prev,
        [key]: { loading: false, uri },
      }));
    } catch (e) {
      console.warn("Generation failed", e);
      Alert.alert("Error", "Failed to generate audio. Please try again.");
      setOptions((prev) => ({
        ...prev,
        [key]: { loading: false, uri: null },
      }));
    }
  };

  const play = async (uri: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn("Play failed", e);
      Alert.alert("Error", "Could not play this audio file.");
    }
  };

  const download = async (uri: string) => {
    try {
      const fileName = uri.split("/").pop() ?? `audio-${Date.now()}.mp3`;
      const dest = FileSystem.documentDirectory + fileName;

      await FileSystem.copyAsync({ from: uri, to: dest });

      Alert.alert(
        "Saved",
        "Audio saved to your app documents folder on this device."
      );
    } catch (e) {
      console.warn("Download failed", e);
      Alert.alert("Error", "Could not save this file to the device.");
    }
  };

  const renderOption = (label: string, key: OptionKey, prompt: string) => {
  const state = options[key];

  return (
    <View style={styles.optionCard}>
      <Text style={styles.optionTitle}>{label}</Text>
      <Text style={styles.optionPrompt}>{prompt}</Text>

      <Pressable
        style={[styles.button , state.loading && styles.buttonDisabled]}
        disabled={state.loading || !prompt}
        onPress={() => generate(key, prompt)}
      >
        {state.loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.buttonText}>Generate</Text>
        )}
      </Pressable>

      {state.uri && (
        <View style={styles.actions}>
          <Pressable style={styles.button} onPress={() => play(state.uri!)}>
            <Text style={styles.buttonText}>▶ Play</Text>
          </Pressable>

          <Pressable
            style={styles.buttonAlt}
            onPress={() => download(state.uri!)}
          >
            <Text style={styles.buttonText}>⬇ Download</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

  return (
    <View style={styles.container}>

      <View style={styles.descBox}>
        <Text style={styles.descLabel}>Original Prompt</Text>
        <Text style={styles.descText}>{originalPrompt}</Text>
      </View>

      {renderOption(h1, "option1", option1)}
      {renderOption(h2, "option2", option2)}
      {renderOption(h3, "option3", option3)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0f172a", 
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#38bdf8", 
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#2dd4bf", 
    marginBottom: 22,
    textAlign: "center",
  },
  descBox: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#334155",
  },
  descLabel: {
    color: "#7dd3fc",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  descText: {
    color: "#e5e7eb",
    fontSize: 14,
    lineHeight: 22,
  },
  optionCard: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0ea5e9",
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#38bdf8",
    marginBottom: 6,
  },
  optionPrompt: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 12,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  button: {
    backgroundColor: "#0ea5e9",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonAlt: {
    flex: 1,
    backgroundColor: "#2dd4bf",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center", 
  },
  buttonDisabled: {
    backgroundColor: "#475569",
  },
  buttonText: {
    color: "#020617",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingText: {
    color: "#7dd3fc",
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
  },
});

