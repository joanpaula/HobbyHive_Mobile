import { Tabs } from "expo-router";
import { AntDesign, Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs
        
        screenOptions={{
            tabBarInactiveTintColor: 'black'
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
                name="messaging"
                options={{
                    title: 'Messages',
                    headerTitle: 'HobbyHive',
                    headerTintColor: '#FF5700',
                    tabBarIcon: ({ color }) => <AntDesign name="message" size={24} color={color} />
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
