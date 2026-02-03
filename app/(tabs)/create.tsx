import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Button, Image } from 'react-native'

type Post = {
    id?: string;
    user_id: string;
    username: string;
    body_text: string;
    media_url: string[];
    created_at: string;
};


export default function CreatePosts({ post }: { post: Post }) {

    const [bodyText, setBodyText] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [albums, setAlbums] = useState(null)

    const handleCreatePost = async () => {
        try {

            const formData = new FormData();
            formData.append("username", post?.username || "Anonymous");
            formData.append("body_text", bodyText);

            if (image) {
                formData.append("image", {
                    uri: image,
                    name: 'photo.jpg',
                    type: 'image/jpeg',
                } as any);
            }

            const response = await fetch("http://10.178.12.65:5000/posts/create", {
                method: 'POST',
                body: formData
            })
            const data = await response.json();
            console.log("Post created:", data);

            if (response.ok) {
                alert("Post created successfully!");
                setBodyText("");
            } else {
                console.error("Failed to create post:", data);
            }

        } catch (error) {
            console.error("Error creating post:", error);
        }
    }


    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync();
        console.log("Result from camera:", result);
        if (!result.canceled) {
            console.log("Image selected:", result.assets[0].uri);
            setImage(result.assets[0].uri);
        }
    }

    const pickFromGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync();
        console.log("Result from gallery:", result);
        if (!result.canceled) {
            console.log("Image selected:", result.assets[0].uri);
            setImage(result.assets[0].uri);
        }
    }


    return (
        <View style={styles.container}>

            <View style={styles.headerContainer}>

                <View style={{ width: 60 }} />

                <Text style={styles.header}>Create New Post</Text>

                <Pressable
                    onPress={handleCreatePost}
                    style={styles.button}>
                    <Text style={styles.buttonText}>Post</Text>
                </Pressable>

            </View>

            <View>
                <Text style={styles.username}>{post?.username || "Anonymous"}</Text>
            </View>

            <TextInput
                style={styles.description}
                placeholder="Share your thoughts..."
                placeholderTextColor="#999"
                value={bodyText}
                onChangeText={setBodyText}
                multiline
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 }}>
                <Button title="Take Photo" onPress={takePhoto} />
                <Button title="Select Image From Gallery" onPress={pickFromGallery} />

            </View>

            <View>
                <Text>Selected Image:</Text>
                {image && <Image source={{ uri: image }} style={{ width: 100, height: 100 }} />}
            </View>

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