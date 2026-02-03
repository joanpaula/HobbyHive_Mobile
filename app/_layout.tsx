import { Slot } from "expo-router";
import { MenuProvider } from "react-native-popup-menu";

export default function RootLayout() {
  return (
    <MenuProvider>
      <Slot />
    </MenuProvider>
  );
}
