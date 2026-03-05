import { Slot, Stack } from "expo-router";
import { MenuProvider } from "react-native-popup-menu";
import { AuthProvider } from "@/utils/authContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PostProvider } from "@/utils/postContext";
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <PaperProvider>
        <PostProvider>
          <AuthProvider>
            <MenuProvider>
              <Slot />
            </MenuProvider>
          </AuthProvider>
        </PostProvider>
        </PaperProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
