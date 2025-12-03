

import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View, } from "react-native";
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
  const [error , setError]  = useState<string|null>(null)

  useEffect(()=>{
    if (!h1 && !h2 && !h3 || !option1 && !option2 && !option3){
      setError('Crash')
    }
  },[])

  function handleBack(){
    router.push('./chat')
  }




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



  if (error) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>⚠️ Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

  return (
    <View style={styles.optionCard}>
      <Text style={styles.optionTitle}>{label}</Text>
      <Text style={styles.optionPrompt}>{prompt}</Text>

      {!state.uri && (
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
      )}

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
    <ScrollView style={styles.container}>

      <View style={styles.descBox}>
        <Text style={styles.descLabel}>Original Prompt</Text>
        <Text style={styles.descText}>{originalPrompt}</Text>
      </View>

      {renderOption(h1, "option1", option1)}
      {renderOption(h2, "option2", option2)}
      {renderOption(h3, "option3", option3)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8E6F0",
    padding: 20,
  },
  retryButton: {
    backgroundColor: "#FF7B9C",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#1B2449",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorTitle: {
    fontSize: 24,
    color: "#FF7B9C",
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorText: {
    color: "#1B2449",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#E8E6F0",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1B2449",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#1B2449",
    marginBottom: 22,
    textAlign: "center",
  },
  descBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#FF7B9C",
  },
  descLabel: {
    color: "#FF7B9C",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  descText: {
    color: "#1B2449",
    fontSize: 14,
    lineHeight: 22,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FF7B9C",
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B2449",
    marginBottom: 6,
  },
  optionPrompt: {
    fontSize: 14,
    color: "#1B2449",
    marginBottom: 12,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  button: {
    backgroundColor: "#FF7B9C",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonAlt: {
    flex: 1,
    backgroundColor: "#FF7B9C",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#F2B8C6",
  },
  buttonText: {
    color: "#1B2449",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingText: {
    color: "#1B2449",
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
  },
});

