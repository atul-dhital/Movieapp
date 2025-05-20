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
          <Stack>
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="movie/[id]"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
        </SnackbarProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
