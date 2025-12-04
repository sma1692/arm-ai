import { Stack } from "expo-router";
import { KeyboardAvoidingView, Platform, StyleSheet, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AudioLayout() {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  container: {
    flex: 1,
  },
});
