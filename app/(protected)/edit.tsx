import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { createApiClient } from '@/services/apiClient';
import { usePosts } from '@/utils/postContext';

// the structure of Post object
type Post = {
    _id: string;
    user_id: string;
    username: string;
    body_text: string;
    media_url: string[];
    created_at: string;
};

export default function EditPost() {

    // ------set states-------

    const apiClient = createApiClient("json")

    const router = useRouter();

    const { id, post } = useLocalSearchParams();

    // selcted post being edited
    const editingPost: Post | null = post ? JSON.parse(post as string) : null;

    const [bodyText, setBodyText] = useState(editingPost?.body_text);

    const {showGlobalSnackbar} = usePosts()

    // edit posts functionality
    const editPost = async () => {

        if (!id) {
            // Alert.alert("Error", "No post to edit");
            return;
        }

        // retrieve current body text
        setBodyText(bodyText);

        const response = await apiClient.put(`/api/v1.0/posts/${id}`, { body_text: bodyText });
        console.log(response.data)

        if (response.status) {
            showGlobalSnackbar("Post EDITED Successfully! 🐝")
            router.replace("/(protected)/(tabs)")
        }
    }

    return (

        <View style={styles.container}>

            <Stack.Screen
                options={{
                    title: 'Edit',
                    headerTitle: 'Edit',
                    headerTintColor: '#FF5700',
                }}
            />

            <View style={styles.headerContainer}>

                <View style={{ width: 60 }} />

                <Text style={styles.header}>Edit Post</Text>

                <Pressable
                    onPress={editPost}
                    style={styles.button}>
                    <Text style={styles.buttonText}>Save</Text>
                </Pressable>

            </View>

            <TextInput
                style={styles.description}
                placeholder="Share your thoughts..."
                placeholderTextColor="#999"
                value={bodyText}
                onChangeText={setBodyText}
                multiline
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
        marginVertical: 20,
        borderRadius: 9,
        height: 80,
        width: 330,
        backgroundColor: "white"
    }

})
