import { Slot, Stack } from "expo-router";
import { MenuProvider } from "react-native-popup-menu";
import { AuthProvider } from "@/utils/authContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <MenuProvider>
        <Slot />
      </MenuProvider>
    </AuthProvider>

  );
}
