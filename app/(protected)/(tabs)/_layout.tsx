import { Tabs } from "expo-router";
import { AntDesign, Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext } from 'react';
import { AuthContext } from '@/utils/authContext';

export default function TabLayout() {
    const {user} = useContext(AuthContext);
    return (
        <Tabs
            screenOptions={{
                tabBarInactiveTintColor: 'black',
                headerRight: () => (
                    <View>
                        <Text
                            style={{fontWeight: "bold", fontSize: 20, marginRight: 16}}>
                                {user?.username}
                        </Text>
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
                    headerTitle: 'Create',
                    headerTintColor: '#FF5700',
                    tabBarIcon: ({ color }) => <Feather name="plus-circle" size={24} color={color} />
                }} />
            <Tabs.Screen
                name="places"
                options={{
                    title: 'Places',
                    headerTitle: 'Nearby Places',
                    headerTintColor: '#FF5700',
                    tabBarIcon: ({ color }) => <AntDesign name="environment" size={24} color={color} />
                }} />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    headerTitle: 'Profile',
                    headerTintColor: '#FF5700',
                    tabBarIcon: ({ color }) => <FontAwesome5 name="user" size={24} color={color} />
                }} />
        </Tabs>
    )
}
