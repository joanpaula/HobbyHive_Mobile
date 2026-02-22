import { Tabs } from "expo-router";
import { AntDesign, Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, Pressable, View } from 'react-native';
import { router } from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarInactiveTintColor: 'black',
                headerRight: () => (
                    <View>
                        <Pressable
                            onPress={() => router.push("/auth/login")}
                            style={{ marginRight: 16, padding: 6, backgroundColor: "#ff5700", borderRadius: 15 }}>
                            <Text style={{ color: "white" }}>Login</Text>
                        </Pressable>
                    </View>
                )
            }}

        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerTitle: 'HobbyHive',
                    headerTintColor: '#FF5700',
                    tabBarIcon: ({ color }) => <AntDesign name="home" size={24} color={color} />
                }} />
            <Tabs.Screen
                name="communities"
                options={{
                    title: 'Hives',
                    headerTitle: 'HobbyHive',
                    headerTintColor: '#FF5700',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="beehive-outline" size={24} color={color} />
                }} />
            <Tabs.Screen
                name="create"
                options={{
                    title: 'Create',
                    headerTitle: 'HobbyHive',
                    headerTintColor: '#FF5700',
                    tabBarIcon: ({ color }) => <Feather name="plus-circle" size={24} color={color} />
                }} />
            <Tabs.Screen
                name="places"
                options={{
                    title: 'Places',
                    headerTitle: 'HobbyHive',
                    headerTintColor: '#FF5700',
                    tabBarIcon: ({ color }) => <AntDesign name="environment" size={24} color={color} />
                }} />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    headerTitle: 'HobbyHive',
                    headerTintColor: '#FF5700',
                    tabBarIcon: ({ color }) => <FontAwesome5 name="user" size={24} color={color} />
                }} />
        </Tabs>
    )
}
