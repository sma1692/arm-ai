import React, { useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AudioGen } from "../mod/AudioGen"; // <- adjust path as needed


export default function Index() {
  const [prompt, setPrompt] = useState(
    "warm arpeggios on house beats 120BPM with drums effect"
  );
  const [loading, setLoading] = useState(false);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onGeneratePress = async () => {
    try {
      setLoading(true);
      const uri = await AudioGen.generate(prompt); // content:// URI
      console.log("Saved to:", uri);
      setFilePath(uri);
    } catch (e: any) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio generator</Text>

      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        style={styles.input}
        placeholder="Enter your prompt…"
      />

      <Button title="Generate audio" onPress={onGeneratePress} disabled={loading} />

      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}

      {filePath && (
        <Text style={styles.result}>
          Saved WAV file at:
          {"\n"}
          {filePath}
        </Text>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  result: {
    marginTop: 16,
    textAlign: "center",
  },
  error: {
    marginTop: 16,
    color: "red",
    textAlign: "center",
  },
});
