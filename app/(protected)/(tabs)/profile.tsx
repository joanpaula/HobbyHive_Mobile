import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Feather, Octicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { AuthContext } from '@/utils/authContext';
import { Redirect } from 'expo-router';
import { createApiClient } from '@/services/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function UserProfile() {

    const authState = useContext(AuthContext);
    const user = useContext(AuthContext);

    const apiClient = createApiClient()

    if (!authState.isLoggedIn) {
        return <Redirect href="/auth/login"/>
    }

    if (!user) return <Text>Loading...</Text>

    const handleLogout = async () => {
        try {
            const token = await AsyncStorage.getItem("auth_token");
            if (!token) return;

            await apiClient.get("/api/v1.0/logout", {
                headers: {"x-access-token": token ?? ""}
            })
            authState.logOut();
        } catch (error) {
            console.error("Logout failed", error)
        } 
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.profile}>
                <Image
                    style={styles.profileAvatar}
                    source={require("../../../assets/images/1000590504.jpg")}
                    alt="profile Picture"
                />
                <Text style={styles.profileName}> @JJonDaBeat </Text>
                <Text style={styles.profileEmail}>Active since: Oct 2025</Text>

                <TouchableOpacity
                    // onPress={}
                >
                    <View style={styles.profileAction}>
                        <Text style={styles.profileActionText}>Edit Profile</Text>
                        <Feather name="edit" size={20} color="white" />
                    </View>
                </TouchableOpacity>
            </View>
            <View>
                <Text style={styles.profileHeader}>Personal Information</Text>

                <View>
                    <Text style={styles.inputFieldTitle}>Name</Text>
                    <View style={styles.inputFieldContainer}>
                        <Feather name="user" size={20} color="#999" />
                        {/* <TextInput/> */}
                        <Text style={styles.inputText}>Joan Paula Izuchukwu</Text>
                    </View>

                    <Text style={styles.inputFieldTitle}>Email</Text>
                    <View style={styles.inputFieldContainer}>
                        <Octicons name="mail" size={20} color="#999" />
                        {/* <TextInput/> */}
                        <Text style={styles.inputText}>joanpaula@user.com</Text>
                    </View>

                    <Text style={styles.inputFieldTitle}>Password</Text>
                    <View style={styles.inputFieldContainer}>
                        <Octicons name="lock" size={20} color="#999" />
                        {/* <TextInput/> */}
                        <Text style={styles.inputText}>*****</Text>
                    </View>

                </View>

            </View>

            <TouchableOpacity
                onPress={handleLogout}
            >
                <View style={styles.statusAction}>
                    <Text style={styles.statusActionText}>LOGOUT</Text>
                </View>
            </TouchableOpacity>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white"
    },
    profile: {
        padding: 20,
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    profileAvatar: {
        width: 120,
        height: 120,
        borderRadius: 9999
    },
    profileName: {
        marginTop: 12,
        fontSize: 20,
        fontWeight: "600",
        color: "#090909"
    },
    profileEmail: {
        marginTop: 6,
        fontSize: 16,
        fontWeight: "400",
        color: "#848484"
    },
    profileAction: {
        marginTop: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FF5700",
        borderRadius: 12
    },
    profileActionText: {
        marginRight: 8,
        fontSize: 15,
        fontWeight: "600",
        color: "#fff"
    },
    statusAction: {
        margin: 12,
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "flex-end",
        backgroundColor: "#FF5700",
        borderRadius: 20
    },
    statusActionText: {
        color: "#fff",
        fontWeight: "bold",

    },
    profileHeader: {
        fontWeight: "bold",
        fontSize: 20,
        paddingHorizontal: 18,
        marginBottom: 12
    },
    inputFieldTitle: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,

        fontSize: 15
    },
    inputFieldContainer: {
        borderWidth: 1,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        margin: 12,
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    inputText: {
        marginLeft: 15,
        fontSize: 15,
        color: "#999",
    }
})