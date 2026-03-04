import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Pressable } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { createApiClient } from '@/services/apiClient';
import { Video, ResizeMode } from 'expo-av';
import React, { useState, useEffect } from 'react';
import { usePosts } from '@/utils/postContext';

// the structure of Post object
type Post = {
    _id: string;
    user_id: string;
    username: string;
    body_text: string;
    media_url: string[];
    likes_count: number;
    liked: boolean;
    comments_count?: number;
    hobby_tag?: string[];
    created_at: string;
};

// the structure of Comment object
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

export default function PostCard({ post: initialPost, onOpenComments }: Props) {

    const apiClient = createApiClient("json");

    // selected image state
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // global states/ fucntions from usePost
    const { likePost, posts = [], removePost } = usePosts();

    // get current post being interacted with
    const currentPost = posts?.find(p => p._id === initialPost._id) || initialPost;

    // liked state for animation of post
    const liked = useSharedValue(currentPost.liked ? 1 : 0);

    // comment state
    const [comments, setComments] = useState<Comment[]>([]);

    // covert date from ISO for form to e.g. 04-03-2026
    const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        const day = date.getDate().toString().padStart(2, "0");
        const month = date.toLocaleDateString("default", { month: "numeric" });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // fucction that handle's delete post
    const deletePost = async () => {

        const response = await apiClient.delete(`/api/v1.0/posts/${currentPost._id}`)

        if (response.status) {
            removePost(currentPost._id);
            router.replace("/(protected)/(tabs)")
        }

    };


    // on page load, display like info
    useEffect(() => {
        liked.value = currentPost.liked ? 1 : 0;
    }, [currentPost.liked])

    // get like info from db, 
    // if function is called and post is liked by user (1), unlike post
    const toggleLike = async () => {
        try {
            const backendLiked = await likePost(currentPost._id)
            liked.value = backendLiked ? 1 : 0
        } catch (error) {
            console.log("Error toggling like:", error)
        }
    }

    // rendering the media on the postcard, handling the sizing and arrangement
    const renderMedia = () => {
        
        // if there's no mediaurl stored for current post, do nothing
        if (!currentPost?.media_url || currentPost.media_url.length === 0) {
            return (null)
        }

        // how many media items are prensent
        const mediaCount = currentPost.media_url.length;

        return (
            <View style={styles.mediaContainer}>
                {/* ARRANGEMENT OF MEDIA (images and videos) */}
                {currentPost.media_url.map((url, index) => {
                    const cleanUrl = url.split('?')[0];
                    const isVideo = cleanUrl.match(/\.(mp4|mov|webm)$/i);

                    // arrangement of media items depending on how many is present
                    const itemWidth = mediaCount === 1 ? "100%" : mediaCount === 2 ? "48%" : "32%";

                    return (
                        <View key={index} style={[styles.mediaWrapper ,{width: itemWidth}]}>
                            {isVideo ? (
                                <Video
                                source={{ uri: url }}
                                style={styles.mediaItem}
                                useNativeControls
                                resizeMode={ResizeMode.COVER}
                            />
                            ) : (
                                <TouchableOpacity key={index} onPress={() => setSelectedImage(url)}>
                                <Image
                                    source={{ uri: url }}
                                    style={styles.mediaItem}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                            )}
                        </View>
                    )
                })}

                {/* WHAT HAPPENS WHEN IMAGE IS CLICKED ON */}
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
            </View>
        )

    }

    // handles animation when like button has been unclicked
    const outlineStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: interpolate(liked.value, [0, 1], [1, 0], Extrapolation.CLAMP) }
            ]
        }
    })

    // handles animation when like button has been clicked
    const fillStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: liked.value }
            ],
            opacity: liked.value
        }
    })

    // on page load, get comments for all posts
    useEffect(() => {
        const getComments = async () => {
            // calls get comments api
            const response = await apiClient.get(`/api/v1.0/posts/${currentPost._id}/comments`)
            setComments(response.data)
        }

        getComments()

    }, [currentPost._id]);

    return (

        <View style={styles.card}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                

                {/* POSTCARD ARRANGEMENT - how post details look on a card */}
                <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 7 }}>
                    {/* USER PROFILE PICTURE - hardcoded avatar/ image */}
                    <Image
                        style={styles.profileAvatar}
                        source={require("@/assets/images/profile_icon.png")}
                    />
                    {/* DISPLAYS POST DETAILS - retrived from backend/ db */}
                    <View style={{ marginLeft: 10 }}>
                        <Text style={styles.username}>{currentPost.username}</Text>
                        <Text style={{ color: "gray", fontSize: 12 }}>
                            {
                                // if has hobby tags and they are more than one...
                                currentPost.hobby_tag && currentPost.hobby_tag.length > 0
                                    // join with a comma
                                    ? currentPost.hobby_tag.join(", ")
                                    // else (if there are no hobby tags) default to "Other" as the tag
                                    : "Other"
                            }
                        </Text>
                    </View>
                </View>

                {/* SIDE MENU - handles edit and delete functionalitie for posts */}
                <Menu>
                    <MenuTrigger>
                        <Text style={{ fontSize: 18, padding: 8 }}>⋮</Text>
                    </MenuTrigger>

                    <MenuOptions>
                        {/* EDIT POST - edits current post */}
                        <MenuOption onSelect={() => {

                            // alert("Editing post " + currentPost._id);

                            // redirect to teh edit page
                            router.push({
                                pathname: '/edit',
                                params: { id: currentPost._id, post: JSON.stringify(currentPost) }
                            });
                        }}>
                            <Text style={styles.option}>Edit</Text>
                        </MenuOption>

                        {/* DELETE POST - deletes current post */}
                        <MenuOption onSelect={() => {

                            // alert("deleted " + currentPost._id);

                            // calls delete function
                            deletePost();
                        }}>
                            <Text style={styles.option}>Delete</Text>
                        </MenuOption>

                    </MenuOptions>
                </Menu>

            </View>

            <View>

                {/* SHOWS POST BODY TEXT - the body of the post is rendered */}
                <Text style={styles.bodyText}>{currentPost.body_text}</Text>

                {/* RENDER MEDIA - calls the fuction which handles the arrangement and size of media */}
                <View>{renderMedia()}</View>

            </View>

            {/* LIKES & COMMENTS - this container holds the like and comments of the post */}
            <View style={styles.bottomRow}>

                {/* LIKE ANIMATION - toggles the likes button and animates it for better UX */}
                <Pressable onPress={toggleLike} style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ width: 24, height: 24, justifyContent: "center" }}>
                        {/* UNLIKED POST */}
                        <Animated.View
                            style={[StyleSheet.absoluteFillObject, outlineStyle]}>
                            <FontAwesome name={"heart-o"} size={20} color={"black"} />
                        </Animated.View>

                        {/* LIKED POST */}
                        <Animated.View
                            style={fillStyle}>
                            <View style={{ flexDirection: "row" }}>
                                <FontAwesome name={"heart"} size={20} color={"red"} />
                            </View>
                        </Animated.View>
                    </View>

                    {/* LIKES COUNTS - shows how many likes a post has */}
                    <Text style={{ marginLeft: 10, flexDirection: "row" }}>{currentPost.likes_count}</Text>
                </Pressable>

                {/* WHAT HAPPENS WHEN THE COMMENT ICON IS CLICKED - calls the function */}
                <Pressable onPress={onOpenComments}>
                    <View style={{ flexDirection: "row" }}>
                        <FontAwesome name="comment-o" size={20} />
                        <Text style={{ marginLeft: 10 }}>{currentPost.comments_count}</Text>
                    </View>
                </Pressable>
                {/* DATE CREATED - displays the date of when the post was created */}
                <Text style={styles.date}>{formatDate(currentPost.created_at)}</Text>
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
        marginBottom: 2,
    },
    bodyText: {
        marginBottom: 6
    },
    mediaContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 2,
        paddingVertical: 1,
        alignContent: "center",
        alignItems: "center"
    },
    mediaWrapper: {
        borderRadius: 10,
        overflow: "hidden",
        alignItems: "center"
    },
    mediaItem: {
        width: 200,
        height: 200,
        borderRadius: 10
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
    }

})