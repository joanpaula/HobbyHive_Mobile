import { useRouter } from 'expo-router';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Button, Image } from 'react-native'
import { createApiClient } from '@/services/apiClient';
import { getContentType } from '@/services/globals';

export default function CreatePosts() {

    const router = useRouter();

    const [bodyText, setBodyText] = useState("");

    const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [filename, setFilename] = useState("");

    const postApiClient = createApiClient("form-data")
    const imageApiClient = createApiClient("json")

    const handleCreatePost = async () => {

        const username = "Anonymous"

        let mediaKeys: string[] = [];

        for (const image of images) {

            if (image) {
                const contentType = getContentType(image.fileName!, image?.mimeType)

                const presignRes = await imageApiClient.post("/api/v1.0/presign-url", {
                    filename: image.fileName,
                    contentType: contentType
                });

                const { uploadUrl, key } = presignRes.data;

                const fileResponse = await fetch(image.uri);
                const blob = await fileResponse.blob();

                const s3_upload_repsonse = await fetch(uploadUrl, {
                    method: "PUT",
                    body: blob,
                    headers: {
                        "Content-Type": contentType
                    }
                });

                mediaKeys.push(key)

            }
        }

        const postFormData = new FormData();
        postFormData.append("username", username);
        postFormData.append("body_text", bodyText);

        mediaKeys.forEach((key) => {
            postFormData.append("media_url", key);
        })

        try {
            const response = await postApiClient.post("/api/v1.0/posts/create", postFormData)
            console.log(response.data)
            alert("Post created successfully!");
            setBodyText("");
            setImages([])
            router.replace("/(tabs)");
        } catch (error: any) {
            console.log(error.response?.status)
            console.log(error.response?.data)
        }

    }

    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync();
        console.log("Result from camera:", result);
        if (!result.canceled) {
            console.log("Image selected:", result.assets[0].uri);
            setImages(prev => [...prev, ...result.assets]);
            console.log("Images selected:", [...images, ...result.assets]);
        }
    }

    const pickFromGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            allowsMultipleSelection: true
        });
        console.log("Result from gallery:", result);
        if (!result.canceled) {
            setImages(prev => [...prev, ...result.assets]);
            console.log("Images selected:", [...images, ...result.assets]);
        }
    }

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

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 }}>
                <Button title="Take Photo" onPress={takePhoto} />
                <Button title="Select Image From Gallery" onPress={pickFromGallery} />

            </View>

            <View>
                <Text>Selected Image:</Text>
                {images && images.length > 0 ? (
                    images.map((image, index) => (
                        <Image
                            key={index}
                            source={{ uri: image.uri }}
                            style={{
                                width: 100,
                                height: 100,
                                padding: 10,
                                // flex: 1, 
                                // flexDirection: 'column', 
                                // flexWrap: 'wrap' 
                            }}
                        />))) : (<Text>(No images selected)</Text>)}
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