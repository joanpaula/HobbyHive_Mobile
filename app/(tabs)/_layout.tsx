import { Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerTitle: 'HobbyHive',
                    headerTintColor: '#FF5700',
                }} />
                <Tabs.Screen
                name="communities"
                options={{
                    title: 'Hives',
                    headerTitle: 'HobbyHive',
                    headerTintColor: '#FF5700',
                }} />
                <Tabs.Screen
                name="create"
                options={{
                    title: 'Create',
                    headerTitle: 'HobbyHive',
                    headerTintColor: '#FF5700',
                }} />
                <Tabs.Screen
                name="messaging"
                options={{
                    title: 'Messages',
                    headerTitle: 'HobbyHive',
                    headerTintColor: '#FF5700',
                }} />
                <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    headerTitle: 'HobbyHive',
                    headerTintColor: '#FF5700',
                }} />
        </Tabs>
    )
}
