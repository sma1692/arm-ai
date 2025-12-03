import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { audio_wave, downloadButton, playButton, share } from "../../assets";
import { AudioGen } from "../../mod/AudioGen";


type OptionKey = "option1" | "option2" | "option3";

type OptionState = {
  loading: boolean;
  uri: string | null;
};

export default function AudioGenOptions() {
  const { originalPrompt, h1, h2, h3, option1, option2, option3 } =
    useLocalSearchParams<{
      originalPrompt: string;
      h1: string;
      h2: string;
      h3: string;
      option1: string;
      option2: string;
      option3: string;
    }>();

  const [options, setOptions] = useState<Record<OptionKey, OptionState>>({
    option1: { loading: false, uri: null },
    option2: { loading: false, uri: null },
    option3: { loading: false, uri: null },
  });
  const [error, setError] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<OptionKey | null>(null);

  

  useEffect(() => {
    if ((!h1 && !h2 && !h3) || (!option1 && !option2 && !option3)) {
      setError("Crash");
    }
  }, []);

  function handleBack() {
    router.push("./chat");
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

  const play = async (uri: string, key: OptionKey) => {
    try {
      setCurrentlyPlaying(key);

      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;

        if (status.didJustFinish) {
          sound.unloadAsync();
          setCurrentlyPlaying(null); // reset back to play icon
        }
      });
    } catch (e) {
      setCurrentlyPlaying(null);
      console.warn("Play failed", e);
      Alert.alert("Error", "Could not play this audio file.");
    }
  };

  const download = async (uri: string) => {
    try {
      const fileName = uri.split("/").pop() ?? `audio-${Date.now()}.mp3`;
      const dest = FileSystem.documentDirectory + fileName;

      await FileSystem.copyAsync({ from: uri, to: dest });

      Alert.alert("Saved", `Audio saved here:\n${dest}`);
    } catch (e) {
      console.warn("Download failed", e);
      Alert.alert("Error", "Could not save this file to the device.");
    }
  };

  const shareAudio = async (uri: string, label: string, prompt: string) => {
    try {
      const moodText =
        prompt && prompt.trim().length > 0
          ? `${label} : ${prompt}`
          : label || prompt;

      const message = `Hey! I just created the backing track for my post using Echomood. It gave me the following mood - ${moodText}. Download the app now!`;

      // Basic text share (fast + reliable)
      await Share.share({
        message,
        // If you want to *try* attaching the file as well, uncomment this:
        // url: uri,
      });
    } catch (e) {
      console.warn("Share failed", e);
      Alert.alert("Error", "Could not open the share sheet.");
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
            style={[styles.button, state.loading && styles.buttonDisabled]}
            disabled={state.loading || !prompt}
            onPress={() => generate(key, prompt)}
          >
            {state.loading ? (
              <Text style={styles.buttonText}>
                Creating your mood… standby
              </Text>
            ) : (
              <Text style={styles.buttonText}>Create my mood</Text>
            )}
          </Pressable>
        )}

        {state.uri && (
          <View style={styles.actions}>
            {/* PLAY / WAVEFORM TOGGLE */}
            <Pressable
              style={styles.iconButton}
              onPress={() => play(state.uri!, key)}
            >
              <Image
                source={currentlyPlaying === key ? audio_wave : playButton}
                style={[
                  styles.iconImage,
                  currentlyPlaying === key && { opacity: 0.5 },
                ]}
                resizeMode="contain"
              />
            </Pressable>

            {/* SHARE ICON */}
            <Pressable
              style={styles.iconButton}
              onPress={() => shareAudio(state.uri!, label, prompt)}
            >
              <Image source={share} style={styles.iconImage} resizeMode="contain" />
            </Pressable>

            {/* DOWNLOAD BUTTON */}
            <Pressable
                style={styles.downloadButton}
                onPress={() => download(state.uri!)}
              >
              <Image source={downloadButton} style={styles.downloadIcon} />
              <Text style={styles.buttonText}>Download</Text>
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

      <Text style={styles.helperText}>
        Here are three soundscapes crafted for your vibe. Pick the one that
        fits your mood best.
      </Text>

      {renderOption(h1, "option1", option1)}
      {renderOption(h2, "option2", option2)}
      {renderOption(h3, "option3", option3)}
      <View style={styles.backContainer}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()} // 👈 goes to previous screen
        >
          <Text style={styles.backButtonText}>Switch the mood</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F2FF",
    padding: 20,
  },
  iconImage: {
  width: 22,
  height: 22,
  },

  downloadIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  backContainer: {
    marginBottom: 16,
    alignItems: "center",
    width:"100%"
  },

  backButton: {
    width:"100%",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#FF7B9C",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent:"center"
  },


  backButtonText: {
    color: "#1B2449",
    fontSize: 14,
    fontWeight: "700",
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#FF7B9C",
    alignItems: "center",
    justifyContent: "center",
  },

  downloadButton: {
    flex: 1,
    backgroundColor: "#FF7B9C",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
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
    backgroundColor: "#F5F2FF",
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
    marginBottom: 16,
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
  helperText: {
    marginBottom: 18,
    fontSize: 13,
    lineHeight: 20,
    color: "#1B2449",
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FF7B9C",
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B2449",
    marginBottom: 4,
  },
  optionPrompt: {
    fontSize: 13,
    color: "#1B2449",
    marginBottom: 10,
    lineHeight: 19,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  iconText: {
    fontSize: 20,
    color: "#1B2449",
  },
  button: {
    backgroundColor: "#FF7B9C",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
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
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
  loadingText: {
    color: "#1B2449",
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
  },
});
