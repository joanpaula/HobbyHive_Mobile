import { AntDesign, Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';

export default function loginPage() {
    return(
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
                />
            </View>

            <View style={styles.textInputContainer}>
                <Feather name="lock" size={20} style={styles.icon} />
                <TextInput
                    style={styles.textinput}
                    placeholder='Enter your password'
                    placeholderTextColor="#999"
                />
            </View>


            <View style={{padding: 10}}>
                <Text style={{textAlign: "right"}}>Forgot password?</Text>
            </View>

            <View style={{padding: 10}}>
                <Pressable
                    // onPress={"..."}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Sign In</Text>
                </Pressable>
            </View>

            <View>
                <Text style={styles.signupPrompt}>Don't have an account? Sign up</Text>
            </View>
            
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignContent: "center"
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
        borderWidth: 1,
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
        paddingVertical: 8
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