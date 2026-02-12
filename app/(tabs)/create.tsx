import { useRouter } from 'expo-router';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Button, Image } from 'react-native'
import { createApiClient } from '@/services/apiClient';

export default function CreatePosts() {

    const router = useRouter();

    const [bodyText, setBodyText] = useState("");

    // const [image, setImage] = useState<string | null>(null);
    // const [albums, setAlbums] = useState(null)

    const apiClient = createApiClient("form-data")

    const handleCreatePost = async () => {

        const username = "Anonymous"

        const formData = new FormData();
        formData.append("username", username);
        formData.append("body_text", bodyText);

        const response = await apiClient.post("/api/v1.0/posts/create", formData)
        if (response.status) {
            alert("Post created successfully!");
            setBodyText("");
            router.replace("/(tabs)");
        }

    }

    // const takePhoto = async () => {
    //     const result = await ImagePicker.launchCameraAsync();
    //     console.log("Result from camera:", result);
    //     if (!result.canceled) {
    //         console.log("Image selected:", result.assets[0].uri);
    //         setImage(result.assets[0].uri);
    //     }
    // }

    // const pickFromGallery = async () => {
    //     const result = await ImagePicker.launchImageLibraryAsync();
    //     console.log("Result from gallery:", result);
    //     if (!result.canceled) {
    //         console.log("Image selected:", result.assets[0].uri);
    //         setImage(result.assets[0].uri);
    //     }
    // }

    return (
        <View style={styles.container}>

            <View style={styles.headerContainer}>

                <View style={{ width: 60 }} />

                <Text style={styles.header}>{"Create New Post"}</Text>

                <Pressable
                    onPress={handleCreatePost}
                    style={styles.button}>
                    <Text style={styles.buttonText}>{"Post"}</Text>
                </Pressable>

            </View>

            <View>
                <Text style={styles.username}>{"Anonymous"}</Text>
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