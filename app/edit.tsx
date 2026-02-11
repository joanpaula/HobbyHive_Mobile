import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Button, Image } from 'react-native'
import { createApiClient } from '@/services/apiClient';

type Post = {
    _id: string;
    user_id: string;
    username: string;
    body_text: string;
    media_url: string[];
    created_at: string;
};

export default function EditPost() {

    const apiClient = createApiClient("json")

    const router = useRouter();

    const { id, post } = useLocalSearchParams(); // search what this means
    const editingPost: Post | null = post ? JSON.parse(post as string) : null;

    const [bodyText, setBodyText] = useState(editingPost?.body_text);

    const editPost = async () => {

        if (!id) {
            Alert.alert("Error", "No post to edit");
            return;
        }

        setBodyText(bodyText);

        const response = await apiClient.put(`/posts/${id}`, { body_text: bodyText });
        console.log(response.data)

        if (response.status) {
            router.replace("/(tabs)")
        }
    }

    return (

        <View style={styles.container}>

            <View style={styles.headerContainer}>

                <View style={{ width: 60 }} />

                <Text style={styles.header}>Edit Post</Text>

                <Pressable
                    onPress={editPost}
                    style={styles.button}>
                    <Text style={styles.buttonText}>Save</Text>
                </Pressable>

            </View>

            <View>
                <Text style={styles.username}>{editingPost?.username}</Text>
            </View>

            <TextInput
                style={styles.description}
                placeholder="Share your thoughts..."
                placeholderTextColor="#999"
                value={bodyText}
                onChangeText={setBodyText}
                multiline
            />

            {/* <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 }}>
                        <Button title="Take Photo" onPress={takePhoto} />
                        <Button title="Select Image From Gallery" onPress={pickFromGallery} />
        
                    </View> */}

            {/* <View>
                        <Text>Selected Image:</Text>
                        {image && <Image source={{ uri: image }} style={{ width: 100, height: 100 }} />}
                    </View> */}

        </View>

    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 12
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
        borderWidth: 1,
        padding: 10,
        margin: 12
    }


})
