import { useRouter } from 'expo-router';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Button, Image } from 'react-native'
import { createApiClient } from '@/services/apiClient';
import { getContentType } from '@/services/globals';
import { useContext } from 'react';
import { AuthContext } from '@/utils/authContext';
import DropDownPicker from 'react-native-dropdown-picker';

// the structure of Hobby object
type Hobby = {
    _id: string;
    hobby: string;
}

// the structure of Picker object
type PickerItem = {
    label: string;
    value: string | number;
}

export default function CreatePosts() {

    const router = useRouter();

    // -----set states------------------

    const apiClient = createApiClient("json");

    const [bodyText, setBodyText] = useState("");

    const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

    const postApiClient = createApiClient("form-data")
    const imageApiClient = createApiClient("json")

    // set user details
    const { user } = useContext(AuthContext);

    const username = user?.username ?? "";

    const [loading, setLoading] = useState(true);

    const [openPicker, setOpenPicker] = useState(false);
    const [pickerValue, setPickerValue] = useState<string[]>([]);
    const [items, setItems] = useState<PickerItem[]>([]);

    useEffect(() => {

        // this is for the hobbies in the picker
        const displayHobbies = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`/api/v1.0/hobbies`)

                const formattedHobbies = response.data.map((hobby: Hobby) => ({
                    label: hobby.hobby,
                    value: hobby.hobby
                }))

                setItems(formattedHobbies)
            } catch (error) {
                console.log("Error fetchig hobbies:", error)
            } finally {
                setLoading(false);
            }
        }
        displayHobbies();
    }, [])

    // handle creating post fucntionality
    const handleCreatePost = async () => {

        let mediaKeys: string[] = [];

        for (const image of images) {

            // if media (started of as images but works for videos as well)
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

        // when user picks from the dropdown picker
        pickerValue.forEach((name: string) => {
            const matchedItem = items.find(item => item.value === name);
            if (matchedItem) {
                postFormData.append("hobby_tag", name)
            }

        })

        mediaKeys.forEach((key) => {
            postFormData.append("media_url", key);
        })

        try {
            const response = await postApiClient.post("/api/v1.0/posts/create", postFormData)
            console.log(response.data)
            alert("Post created successfully!");
            setBodyText("");
            setImages([])
            setPickerValue([])
            router.replace("/(protected)/(tabs)");
        } catch (error: any) {
            console.log(error.response?.status)
            console.log(error.response?.data)
        }

    }

    // users can take photos
    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync();
        console.log("Result from camera:", result);
        if (!result.canceled) {
            console.log("Image selected:", result.assets[0].uri);
            setImages(prev => [...prev, ...result.assets]);
            console.log("Images selected:", [...images, ...result.assets]);
        }
    }

    // users can pick media from gallery
    const pickFromGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
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

                {/* CREATE POST - when user clicks post, creat post */}
                <Pressable
                    onPress={handleCreatePost}
                    style={styles.button}>
                    <Text style={styles.buttonText}>{"Post"}</Text>
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

            {/* DROP DOWN PICKER - for hobbies, 
            users can pick 3 hives to be a part of
             */}
            <View style={styles.dropdownContainer}>
                <DropDownPicker
                    open={openPicker}
                    value={pickerValue}
                    items={items}
                    setOpen={setOpenPicker}
                    setValue={setPickerValue}
                    setItems={setItems}
                    placeholder="Select your hive"
                    placeholderStyle={{ color: "gray" }}
                    listMode="MODAL"
                    modalProps={{
                        animationType: "slide",
                        transparent: true
                    }}
                    modalContentContainerStyle={{
                        backgroundColor: "#FFF",
                        marginHorizontal: 20,
                        marginVertical: "50%",
                        borderRadius: 20,
                        padding: 10
                    }}
                    maxHeight={200}
                    mode="BADGE"
                    badgeColors={["#FF5700"]}
                    badgeTextStyle={{ color: "white" }}
                    badgeDotColors={["white"]}
                    dropDownContainerStyle={{
                        maxHeight: 200,
                        borderColor: "#FF5700",
                        zIndex: 6000
                    }}
                    searchable={true}
                    multiple={true}
                    max={3}
                    style={styles.dropdown}
                />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 }}>
                {/* TAKE PHOTO - users can take photos */}
                <Pressable onPress={takePhoto} style={styles.buttonMedia}>
                    <Text style={styles.buttonText}>Take Photo</Text>
                </Pressable>
                {/* PICK FROM GALLERY - user can pick both images and videos from their gallery */}
                <Pressable onPress={pickFromGallery} style={styles.buttonMedia}>
                    <Text style={styles.buttonText}>Select Media From Gallery</Text>
                </Pressable>
            </View>

            <View style={{flex: 1}}>
                {/* SELECTED MEDIA - display media either selected from gallery or taken with camera */}
                <Text style={{marginTop: 10, fontWeight: "500", textAlign: "center", marginBottom: 10}}>Selected Media</Text>
                <View style={styles.mediaContainer}>
                    {images && images.length > 0 ? (
                        // media sizing
                        images.map((image, index) => (
                            <Image
                                key={index}
                                source={{ uri: image.uri }}
                                style={{
                                    marginTop: 15,
                                    width: 100,
                                    height: 100,
                                    padding: 10,
                                }}
                                resizeMode="cover"
                            />))) : (
                        <Text style={{color: "gray", textAlign: "center"}}>(No images selected)</Text>)
                    }
                </View>
            </View>

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
    },
    dropdownContainer: {
        zIndex: 5000,
        elevation: 5000,
        paddingVertical: 10,
    },
    dropdown: {
        borderColor: 'black',
        borderWidth: 1
    },
    buttonMedia: {
        backgroundColor: '#FF5700',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 9,
        alignItems: 'center'
    },
    mediaContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 2,
        paddingVertical: 1,
        alignContent: "center",
        alignItems: "center"
    }

})