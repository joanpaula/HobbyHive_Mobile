import { Tabs } from "expo-router";
import { AntDesign, Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { useContext } from 'react';
import { AuthContext } from '@/utils/authContext';

export default function TabLayout() {

    // user details
    const {user} = useContext(AuthContext);
    
    // tabs header, colour, activity colour, icons
    return (
        <Tabs
            screenOptions={{
                tabBarInactiveTintColor: 'black',
                // active user detail (username)
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
            {/* HOME PAGE */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerTitle: 'HobbyHive',
                    headerTintColor: '#FF5700',
                    tabBarIcon: ({ color }) => <AntDesign name="home" size={24} color={color} />,
                    tabBarActiveTintColor:"#FF5700"
                }} />

            {/* COMMUNITIES (HIVES) PAGE */}
            <Tabs.Screen
                name="communities"
                options={{
                    title: 'Hives',
                    headerTitle: 'Hives',
                    headerTintColor: '#FF5700',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="beehive-outline" size={24} color={color} />,
                    tabBarActiveTintColor:"#FF5700"
                }} />

            {/* CREATE PAGE */}
            <Tabs.Screen
                name="create"
                options={{
                    title: 'Create',
                    headerTitle: 'Create',
                    headerTintColor: '#FF5700',
                    tabBarIcon: ({ color }) => <Feather name="plus-circle" size={24} color={color} />,
                    tabBarActiveTintColor:"#FF5700"
                }} />

            {/* MAPS/ NEARBY PLACES PAGE */}
            <Tabs.Screen
                name="places"
                options={{
                    title: 'Places',
                    headerTitle: 'Nearby Places',
                    headerTintColor: '#FF5700',
                    tabBarIcon: ({ color }) => <AntDesign name="environment" size={24} color={color} />,
                    tabBarActiveTintColor:"#FF5700"
                }} />

            {/* USER PROFILE PAGE */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    headerTitle: 'Profile',
                    headerTintColor: '#FF5700',
                    tabBarIcon: ({ color }) => <FontAwesome5 name="user" size={24} color={color} />,
                    tabBarActiveTintColor:"#FF5700"
                }} />
        </Tabs>
    )
}
