import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { createApiClient } from '@/services/apiClient';
import { usePosts } from '@/utils/postContext';

// the structure of User object
type User = {
    _id: string;
    name: string;
    username: string;
    password: string;
    email: string;
    admin: boolean;
    created_at: string;
};

export default function EditPost() {

    // ------set states-------

    const apiClient = createApiClient("json")

    const router = useRouter();

    const { id, user } = useLocalSearchParams();
    const editingProfile: User | null = user ? JSON.parse(user as string) : null;

    const [name, setName] = useState(editingProfile?.name);
    const [username, setUsername] = useState(editingProfile?.username);
    const [email, setEmail] = useState(editingProfile?.email);
    const [password, setPassword] = useState("");

    const {showGlobalSnackbar} = usePosts()


    const editProfile = async () => {

        if (!id) {
            // Alert.alert("Error", "No user to edit");
            return;
        }

        setName(name);
        setUsername(username)
        setPassword(password)
        setEmail(email)

        const response = await apiClient.put(`/api/v1.0/users/${id}`, { name, username, password, email });
        console.log(response.data)

        if (response.status) {
            showGlobalSnackbar("Profile UPDATED Successfully! 🐝")
            router.replace("/(protected)/(tabs)/profile")
        }
    }

    return (

        <View style={styles.container}>

            <Stack.Screen
                options={{
                    title: 'EditProfile',
                    headerTitle: 'Edit Profile',
                    headerTintColor: '#FF5700',
                }}
            />

            <View style={styles.headerContainer}>

                <View style={{ width: 60 }} />

                <Text style={styles.header}>Edit Profile</Text>

                <Pressable
                    onPress={editProfile}
                    style={styles.button}>
                    <Text style={styles.buttonText}>Save</Text>
                </Pressable>

            </View>

            <TextInput
                style={styles.description}
                placeholder="Name..."
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
            />

            <TextInput
                style={styles.description}
                placeholder="Username..."
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
            />

            <TextInput
                style={styles.description}
                placeholder="Password..."
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
            />

        </View>

    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: "white"
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    header: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1
    },
    button: {
        backgroundColor: '#FF5700',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'center'
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16
    },
    username: {
        fontWeight: 'bold'
    },
    description: {
        borderColor: 'black',
        borderWidth: 1,
        padding: 10,
        marginVertical: 10,
        borderRadius: 9,
        height: 50,
        width: 330,
        backgroundColor: "white"
    }

})
