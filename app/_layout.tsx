import { Stack } from "expo-router";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

export default function RootLayout() {
  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
