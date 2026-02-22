import { View, Text, FlatList, StyleSheet, Pressable, Image, TouchableOpacity, Modal } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { router } from 'expo-router';
import { createApiClient } from '@/services/apiClient';
import { Video } from 'expo-av';
import { useState } from 'react';

type Post = {
    _id: string;
    user_id: string;
    username: string;
    body_text: string;
    media_url: string[];
    created_at: string;
};

export default function PostCard({ post }: { post: Post }) {

    const apiClient = createApiClient("json")
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

     const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        const day = date.getDate().toString().padStart(2,"0");
        const month = date.toLocaleDateString("default", {month: "numeric"});
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };
    
    const deletePost = async () => {

        const response = await apiClient.delete(`/api/v1.0/posts/${post._id}`)

        if (response.status) {
            router.replace("/(protected)/(tabs)")
        }

    };

    const renderMedia = () => {
        if (!post?.media_url || post.media_url.length === 0) {
            return (
                <Text style={styles.noMedia}>(No Media on this post)</Text>
            )
        }

        return (
            <>
                {post.media_url.map((url, index) => {
                    const cleanUrl = url.split('?')[0];

                    if (cleanUrl.match(/\.(mp4|mov|webm)$/i)) {
                        return (
                            <Video
                                key={index}
                                source={{ uri: url }}
                                style={{ width: 200, height: 200 }}
                                useNativeControls
                            />
                        );
                    } else {
                        return (
                            <TouchableOpacity key={index} onPress={() => setSelectedImage(url)}>
                                <Image
                                    source={{ uri: url }}
                                    style={{ width: 200, height: 200 }}
                                />
                            </TouchableOpacity>
                        );

                    }
                })}

                <Modal visible={!!selectedImage} transparent={true}>
                    <TouchableOpacity 
                    style={{flex: 1, backgroundColor: "black", justifyContent: "center", alignItems: "center"}}
                    onPress={() => setSelectedImage(null)}>
                        {selectedImage && (
                            <Image
                                source={{uri: selectedImage}}
                                style={{width: '90%', height: '80%', resizeMode: 'contain'}}
                            />
                        )}
                    </TouchableOpacity>
                </Modal>
            </>
        )

    }

    return (

        <View style={styles.card}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                <Text style={styles.username}>{post.username}</Text>

                <Menu>
                    <MenuTrigger>
                        <Text style={{ fontSize: 18, padding: 8 }}>⋮</Text>
                    </MenuTrigger>

                    <MenuOptions>

                        <MenuOption onSelect={() => {
                            alert("Editing post " + post._id);
                            router.push({
                                pathname: '/edit',
                                params: { id: post._id, post: JSON.stringify(post) }
                            });
                        }}>
                            <Text style={styles.option}>Edit</Text>
                        </MenuOption>

                        <MenuOption onSelect={() => {
                            alert("deleted " + post._id);
                            deletePost();
                        }}>
                            <Text style={styles.option}>Delete</Text>
                        </MenuOption>

                    </MenuOptions>
                </Menu>

            </View>

            <View>

                <Text style={styles.bodyText}>{post.body_text}</Text>

                <View>{renderMedia()}</View>

            </View>

            <Text style={styles.date}>{formatDate(post.created_at)}</Text>
        </View>

    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "white",
        outlineColor: "#FF5700",
        outlineWidth: 1,
        padding: 12,
        marginVertical: 8,
        marginHorizontal: 12,
        borderRadius: 10
    },
    username: {
        fontWeight: 'bold',
        marginBottom: 6
    },
    bodyText: {
        marginBottom: 6
    },
    noMedia: {
        color: 'gray',
        fontStyle: 'italic',
        marginBottom: 6
    },
    date: {
        color: 'gray',
        fontSize: 12,
        textAlign: 'right',
        marginBottom: 6
    },
    option: {
        padding: 10,
        fontSize: 16,
    },


})