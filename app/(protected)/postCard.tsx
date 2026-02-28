import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Pressable } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import {FontAwesome6, FontAwesome} from '@expo/vector-icons';
import { router } from 'expo-router';
import { createApiClient } from '@/services/apiClient';
import { Video } from 'expo-av';
import React, { useState, useEffect } from 'react';

type Post = {
    _id: string;
    user_id: string;
    username: string;
    body_text: string;
    media_url: string[];
    likes_count: number;
    liked: boolean;
    created_at: string;
};

type Comment = {
    _id: string;
    user_id: string;
    username: string;
    post_id: string;
    comment: string;
    created_at: string;
}

type Props = {
    post: Post;
    onOpenComments: () => void;
}

export default function PostCard({ post, onOpenComments }: Props) {

    const apiClient = createApiClient("json");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const [isLiked, setIsLiked] = useState(post.liked)
    const [likesCount, setLikesCount] = useState(post.likes_count)

    const liked = useSharedValue(post.liked ? 1 : 0);

    const [comments, setComments] = useState<Comment[]>([]);

    const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        const day = date.getDate().toString().padStart(2, "0");
        const month = date.toLocaleDateString("default", { month: "numeric" });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const deletePost = async () => {

        const response = await apiClient.delete(`/api/v1.0/posts/${post._id}`)

        if (response.status) {
            router.replace("/(protected)/(tabs)")
        }

    };

    const toggleLike = async () => {
        try {
            const response = await apiClient.put(`/api/v1.0/posts/${post._id}/like`, {})

            const { liked: backendLiked, likes_count } = response.data
            setIsLiked(backendLiked)
            setLikesCount(likes_count)

            liked.value = backendLiked ? 1 : 0
        } catch (error) {
            console.log("Error toggling like:", error)
        }
    }

    const renderMedia = () => {
        if (!post?.media_url || post.media_url.length === 0) {
            return (null)
                // <Text style={styles.noMedia}>(No Media on this post)</Text>
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
                        style={{ flex: 1, backgroundColor: "black", justifyContent: "center", alignItems: "center" }}
                        onPress={() => setSelectedImage(null)}>
                        {selectedImage && (
                            <Image
                                source={{ uri: selectedImage }}
                                style={{ width: '90%', height: '80%', resizeMode: 'contain' }}
                            />
                        )}
                    </TouchableOpacity>
                </Modal>
            </>
        )

    }

    const outlineStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: interpolate(liked.value, [0, 1], [1, 0], Extrapolation.CLAMP) }
            ]
        }
    })

    const fillStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: liked.value }
            ],
            opacity: liked.value
        }
    })

    useEffect(() => {
        const getComments = async () => {
            const response = await apiClient.get(`/api/v1.0/posts/${post._id}/comments`)
            setComments(response.data)
        }

        getComments()

    }, [post._id]);

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

            <View style={styles.bottomRow}>
                <Pressable onPress={toggleLike}>
                    <Animated.View
                        style={[StyleSheet.absoluteFillObject, outlineStyle]}>
                        <FontAwesome name={"heart-o"} size={20} color={"black"} />
                    </Animated.View>

                    <Animated.View
                        style={fillStyle}>
                        <View style={{ flexDirection: "row" }}>
                            <FontAwesome name={"heart"} size={20} color={"red"} />
                            <Text style={{ marginLeft: 10 }}>{likesCount}</Text>
                        </View>
                    </Animated.View>
                </Pressable>

                <Pressable onPress={onOpenComments}>
                    <View style={{ flexDirection: "row" }}>
                        <FontAwesome6 name="comment" size={20} />
                        <Text style={{ marginLeft: 10 }}>{comments.length}</Text>
                    </View>
                </Pressable>
                <Text style={styles.date}>{formatDate(post.created_at)}</Text>
            </View>

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
    bottomRow: {
        flexDirection: "row",
        marginTop: 15,
        marginBottom: 2,
        justifyContent: 'space-between',
    },
    likes: {

        // textAlign: "left",

    },
    date: {
        color: 'gray',
        fontSize: 12,
        textAlign: 'right',
        marginBottom: 6,
        alignItems: "flex-end"
    },
    option: {
        padding: 10,
        fontSize: 16,
    },
    profileAvatar: {
        width: 40,
        height: 40,
        borderRadius: 9999,
        // flexDirection: "row"
    },



})