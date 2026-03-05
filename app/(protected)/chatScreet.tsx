import { createApiClient } from "@/services/apiClient";
import { router, Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, View, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// the structure of Message object
type Message = {
    id: string;
    text: string;
    sender: "user" | "ai" // sender can be user or ai
}

export default function ChatBot() {

    // ---------Initialise states-------------

    const apiClient = createApiClient("json")

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const [lastInterest, setLastInterest] = useState<string | null>(null);

    const generateId = (prefix = "") => `${Date.now()}-${Math.random()}-${prefix}`;

    const flatListRef = useRef<FlatList>(null);

    // initial "ai" message on chatbot open 
    const initialMessage: Message = {
        id: generateId("welcome"),
        text: "Hi there! Tell me your interests and I will suggest 3 hobbies for you.",
        sender: "ai"
    };

    // after GEMINI suggestions, "ai" question to continue or end
    const midMessage: Message = {
        id: generateId("next"),
        text: "Would you like more suggestions?\n-> Type 'Y' to generate more suggestions with your initial interests.\n-> Type new interests for differnt suggestions.\n-> Type 'N' to end conversation.",
        sender: "ai"
    };

    // ending message 1 "ai"
    const preEndMessage: Message = {
        id: generateId("closing-1"),
        text: "Thank you using HobbyHive Chatbot! We will miss you.",
        sender: "ai"
    }

    // ending message 2 "ai"
    const endMessage: Message = {
        id: generateId("closing-2"),
        text: "Come back soon! Bebe the chatbot bee 🐝 xx",
        sender: "ai"
    }

    // on load, display initial welcome message
    useEffect(() => {
        setTimeout(() => {
            setMessages([initialMessage])
        }, 600)
    }, []);

    // using GEMINI API to generate hobbies based on user interests
    const generateHobbies = async (interest: string) => {
        try {

            setLoading(true);

            const response = await apiClient.post(`/api/v1.0/suggest-hobbies`, { interest })

            const data = response.data;

            // arranging "ai" reponse for user
            const aiMessage: Message = {
                id: generateId("ai"),
                text: data?.hobbies?.length
                    ? `You should try these:\n-> ${data.hobbies.join("\n-> ")}`
                    : "No suggestion found.",
                sender: "ai"
            };

            setMessages(prev => [...prev, aiMessage]);

            setTimeout(() => {
                setMessages(prev => [...prev, midMessage])
            }, 2000);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    // user message (typing in their interests)
    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userInput = input.trim().toLowerCase();

        const userMessage: Message = {
            id: generateId("user"),
            text: userInput,
            sender: "user"
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");

        // if yes, continue suggestion generation
        if (userInput === "y" && lastInterest) {
            generateHobbies(lastInterest);
        } else if (userInput === "n") {
            // if no, show closing messagess
            setMessages(prev => [...prev, preEndMessage]);
            setMessages(prev => [...prev, endMessage]);

            // redirect back to homepage
            setTimeout(() => {
                setLastInterest(null);
                setMessages([]);
                router.replace("/(protected)/(tabs)")
            }, 5000);

            return;
        } else {
            // conitnue interest generation
            setLastInterest(userInput);
            generateHobbies(userInput);
        }

    };

    // render messages on screen, message bubbles for "ai" and user
    const renderItem = ({ item }: { item: Message }) => (
        <View
            style={[
                styles.messageBubble,
                item.sender === "user" ? styles.userBubble : styles.aiBubble
            ]}
        >
            <Text style={item.sender === "user" ? styles.userMessageText : styles.aiMessageText}>{item.text}</Text>
        </View>
    )

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["bottom"]}>

            {/* PAGE TITLE */}
            <Stack.Screen
                options={{
                    title: 'ChatBot',
                    headerTitle: 'Bebe the Chatbot Bee',
                    headerTintColor: '#FF5700',
                }}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={"height"}
                keyboardVerticalOffset={Platform.OS === "android" ? 120 : 80}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                {loading && (
                    <ActivityIndicator style={{ marginBottom: 8 }} />
                )}

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Tell me what you're interested in..."
                        placeholderTextColor="gray"
                    />
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={sendMessage}
                    >
                        <Text style={{ color: "white" }}>Send</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    messageBubble: {
        padding: 12,
        borderRadius: 16,
        marginBottom: 10,
        maxWidth: "75%"
    },
    userBubble: {
        backgroundColor: "#FF5700",
        alignSelf: "flex-end"
    },
    aiBubble: {
        backgroundColor: "#FFF5F0",
        alignSelf: "flex-start"
    },
    aiMessageText: {
        color: "black"
    },
    userMessageText: {
        color: "white"
    },
    inputContainer: {
        flexDirection: "row",
        padding: 10,
        borderTopWidth: 1,
        borderColor: "#FF5700",
        backgroundColor: "white"
    },
    input: {
        flex: 1,
        backgroundColor: "#f2f2f2",
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 8,
        color: "black"
    },
    sendButton: {
        backgroundColor: "#FF5700",
        paddingHorizontal: 16,
        justifyContent: "center",
        borderRadius: 20
    }
});