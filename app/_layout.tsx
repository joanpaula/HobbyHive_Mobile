import { Slot, Stack } from "expo-router";
import { MenuProvider } from "react-native-popup-menu";
import { AuthProvider } from "@/utils/authContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <BottomSheetModalProvider>
        <AuthProvider>
          <MenuProvider>
            <Slot />
          </MenuProvider>
        </AuthProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
