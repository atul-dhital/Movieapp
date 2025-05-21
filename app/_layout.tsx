import { Stack } from "expo-router";
import "./globals.css";
import { StatusBar } from "react-native";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import { SnackbarProvider } from "@/context/SnackbarContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <UserProvider>
        <SnackbarProvider>
          <StatusBar hidden={true} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="search" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="movie/[id]" />
          </Stack>
        </SnackbarProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
