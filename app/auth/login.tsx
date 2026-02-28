import { AntDesign, Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useContext, useState } from 'react';
import { createApiClient } from '@/services/apiClient';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/utils/authContext';
// import AntDesign from '@expo/vector-icons/AntDesign';

const apiClient = createApiClient("json")

export default function loginPage() {

    const authContext = useContext(AuthContext);

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();

    const handleLogin = async () => {

        const response = await apiClient.post("/api/v1.0/login", { identifier, password })

        try {
            if (response.status) {
                const token = response.data.token;
                await authContext.logIn(token);
                Alert.alert("Login successful", `Welcome back!`)
                // await authContext.logIn(response.data.token)
                // router.replace("/(protected)/(tabs)")
            } else {
                Alert.alert("Login failed", response.data.message || "Unknown error")
            }
        } catch (error) {
            console.error(error)
            Alert.alert("Login error", "Check your credentials and try again.")
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(prev => !prev)
    };

    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.header}>
                    Welcome Back! 🐝
                </Text>
            </View>

            <View style={styles.textInputContainer}>
                <Feather name="mail" size={20} style={styles.icon} />
                <TextInput
                    style={styles.textinput}
                    placeholder='Enter your username or email'
                    placeholderTextColor="#999"
                    keyboardType='email-address'
                    autoCapitalize='none'
                    onChangeText={setIdentifier}
                />
            </View>

            <View style={styles.textInputContainer}>
                <Feather name="lock" size={20} style={styles.icon} />
                <TextInput
                    style={styles.textinput}
                    placeholder='Enter your password'
                    placeholderTextColor="#999"
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                />
                <AntDesign
                    name={showPassword ? "eye" : "eye-invisible"}
                    size={24}
                    onPress={toggleShowPassword}
                />
            </View>

            <View style={{ padding: 10 }}>
                <Text style={{ textAlign: "right" }}>Forgot password?</Text>
            </View>

            <View style={{ padding: 10 }}>
                <Pressable
                    onPress={handleLogin}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Sign In</Text>
                </Pressable>
            </View>

            <View style={{ padding: 10 }}>
                <Text
                    onPress={() => router.push("/auth/signup")}
                    style={styles.signupPrompt}>Don't have an account?
                    <Text style={{ fontWeight: "bold" }}>Sign up</Text>
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