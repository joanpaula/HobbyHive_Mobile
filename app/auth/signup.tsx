import { useState } from "react"
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from "react-native"
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { createApiClient } from "@/services/apiClient";
import { useRouter } from "expo-router";

const apiClient = createApiClient("form-data")

export default function SignUpPage() {

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();

    const handleSignup = async () => {

        const formData = new FormData();
        formData.append("name", name);
        formData.append("username", username);
        formData.append("email", email);
        formData.append("password", password);

        const response = await apiClient.post("/api/v1.0/signup", formData)

        if (response.status) {
            Alert.alert("Signup successful", `Welcome to HobbyHive ${username}`)
            router.replace("/auth/login")
        }
    }

    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.header}>
                    Welcome To HobbyHive! 🐝
                </Text>
            </View>

            <View style={styles.textInputContainer}>
                <Feather name="user" size={20} style={styles.icon} />
                <TextInput
                    style={styles.textinput}
                    placeholder="Name"
                    placeholderTextColor="#999"
                    onChangeText={setName}
                />
            </View>

            <View style={styles.textInputContainer}>
                <MaterialCommunityIcons name="bee-flower" size={20} style={styles.icon} />
                <TextInput
                    style={styles.textinput}
                    placeholder="Username"
                    placeholderTextColor="#999"
                    onChangeText={setUsername}
                />
            </View>

            <View style={styles.textInputContainer}>
                <Feather name="mail" size={20} style={styles.icon} />
                <TextInput
                    style={styles.textinput}
                    placeholder="Email Address"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    onChangeText={setEmail}
                />
            </View>

            <View style={styles.textInputContainer}>
                <Feather name="lock" size={20} style={styles.icon} />
                <TextInput
                    style={styles.textinput}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    onChangeText={setPassword}
                />
            </View>

            <View style={{padding: 10}}>
                <Pressable
                    onPress={handleSignup}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Sign Up</Text>
                </Pressable>
            </View>

            <View style={{ padding: 10 }}>
                <Text
                    onPress={() => router.push("/auth/login")}
                    style={{ textAlign: "center" }}>Already registered?
                    <Text style={{fontWeight: "bold"}}>Login</Text>
                </Text>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignContent: "center",
        backgroundColor: "white"
    },
    header: {
        fontSize: 18,
        textAlign: "center",
        paddingBottom: 10
    },
    icon: {
        margin: 8,
        color: "#666"
    },
    textInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#ddd",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        // paddingBottom: 10,
        marginVertical: 8,
        marginHorizontal: 10
    },
    textinput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 8,
        color: "black"
    },
    button: {
        backgroundColor: '#FF5700',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16
    },
    signupPrompt: {
        padding: 10,
        textAlign: "center"
    }

})