import { Stack } from "expo-router";
import ScreenContainer from "../components/screen-container";

export default function RootLayout() {
  return (
    <ScreenContainer>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </ScreenContainer>
  );
}
