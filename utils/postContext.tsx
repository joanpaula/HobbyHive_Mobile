import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { createApiClient } from "@/services/apiClient";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { View, StyleSheet, Image, FlatList, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useFocusEffect } from "expo-router";
import Feather from '@expo/vector-icons/Feather';
import { Snackbar } from "react-native-paper";

// // the structure of Post object
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

// global states to be used across multiple pages
type PostContextType = {
    loading: boolean;
    posts: Post[];
    setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
    refreshPosts: () => Promise<void>;
    likePost: (postId: string) => Promise<boolean>;
    removePost: (postId: string) => void;
    openComments: (post: Post) => Promise<void>;
    closeComments: () => void;
    comments: Comment[];
    selectedPost: Post | null;
    bottomSheetRef: React.RefObject<BottomSheet | null>
    showGlobalSnackbar: (message: string) => void
    snackbarVisible: boolean;
    setSnackbarVisible: (visible: boolean) => void;
    snackbarMessage: string;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // INITIALISES STATES
    const apiClient = createApiClient("json");
    const commentApiClient = createApiClient("form-data");
    const [posts, setPosts] = useState<Post[]>([]);

    const bottomSheetRef = useRef<BottomSheet>(null);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    const [comments, setComments] = useState<Comment[]>([]);

    const [newComment, setNewComment] = useState("");

    const [loading, setLoading] = useState(true);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const onDismissSnackBar = () => setSnackbarVisible(false);

    const showGlobalSnackbar = (message: string) => {
        setSnackbarMessage(message)
        setSnackbarVisible(true)
    }

    // on load, refesh page
    useFocusEffect(
        useCallback(() => {
            refreshPosts()
        }, [])
    )

    // retrieves posts
    const refreshPosts = async () => {
        try {
            // if not posts, start loading
            setLoading(true)
            // calls get posts api endpoind
            const response = await apiClient.get("/api/v1.0/posts")
            setPosts(response.data)
        } catch (error) {
            console.log("Failed to fetch posts:", error)
        } finally {
            // when posts, stop loading
            setLoading(false)
        }
    };

    // handle the likes functionality
    const likePost = async (postId: string) => {
        try {
            // calls get post likes api endpoint
            const response = await apiClient.put(`/api/v1.0/posts/${postId}/like`, {})
            // retrieve liked(boolean) amd liek counts from the response
            const { liked: backendLiked, likes_count } = response.data;

            setPosts((prev) =>
                prev.map((post) =>
                    post._id === postId ? { ...post, liked: backendLiked, likes_count } : post
                )
            );
            return backendLiked
        } catch (error) {
            console.error("Failed to toggle like:", error)
        }
    };

    // to delete post
    const removePost = (postId: string) => {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
    }

    // on page load, refresh page
    useEffect(() => {
        refreshPosts();
    }, []);


    // call get comments endpoint and open bottom sheet
    const openComments = async (post: Post) => {
        setSelectedPost(post);
        const response = await apiClient.get(`/api/v1.0/posts/${post._id}/comments`);
        setComments(response.data);

        setTimeout(() => {
        bottomSheetRef.current?.expand();
    }, 0);
    };

    // what hanppes whe commennt buttom sheet is closed
    const closeComments = () => {
        setSelectedPost(null);
        setComments([]);
        bottomSheetRef.current?.close();
    };

    const commentFormData = new FormData();
    commentFormData.append("comment", newComment);

    // handles posting comments
    const postComments = async () => {
        try {
            const postId = selectedPost?._id
            const response = await commentApiClient.post(`/api/v1.0/posts/${postId}/comment`, commentFormData)
            const savedComment = response.data;
            setComments((prev) => [savedComment, ...prev])
            setPosts((prev) =>
                prev.map((post) =>
                    post._id === postId ? { ...post, comments_count: (post.comments_count || 0) + 1 } : post
                )
            );
            console.log(response.data)
            setNewComment("");
        }
        catch {

        }
    }

    // format date
    const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        const day = date.getDate().toString().padStart(2, "0");
        const month = date.toLocaleDateString("default", { month: "numeric" });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    return (
        <PostContext.Provider value={{ posts, loading, setPosts, refreshPosts, likePost, removePost, comments, openComments, closeComments, selectedPost, bottomSheetRef, showGlobalSnackbar, snackbarMessage, snackbarVisible, setSnackbarVisible }}>
            {children}

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={4000}
                action={{
                    label: "Okay",
                    labelStyle: { fontSize: 14, color: "white", fontWeight: "600" },
                    onPress: onDismissSnackBar
                }}
                elevation={2}
                style={{ backgroundColor: "#FF5700" }}
            >
                <Text style={{ fontSize: 14, color: "white", fontWeight: "600" }}>{snackbarMessage}</Text>

            </Snackbar>

            {/* COMMENTS - interaction with commnenyt section */}
            {selectedPost && (
                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1}
                    snapPoints={["75%"]}
                    enablePanDownToClose
                    onClose={() => setSelectedPost(null)}
                    backgroundStyle={{ borderTopLeftRadius: 30, borderTopRightRadius: 30, outlineColor: "#FF5700", outlineWidth: 2 }}
                >
                    <BottomSheetView style={{ flex: 1 }}>
                        <View style={{ flex: 1, paddingTop: 20 }} key="comment-list-container">
                            {/* COMMENTS */}
                            <Text style={{ textAlign: "center", fontSize: 20 }} key="empty-text">Comments</Text>
                            {/* if commenst are emoty, diplay this */}
                            {comments.length === 0 ? (
                                <Text style={{ marginTop: 2, marginLeft: 10, color: "gray", textAlign: "center" }}>Be the first to comment...</Text>
                            ) :
                                (
                                    // else display this
                                    <FlatList
                                        data={comments}
                                        keyExtractor={(item) => item._id}
                                        renderItem={({ item }) => (
                                            <View style={styles.commentContainer}>

                                                {/* USER AVATAR - hardcoded user avatar */}
                                                <Image
                                                    style={styles.profileAvatar}
                                                    source={require("@/assets/images/profile_icon.png")}
                                                    alt="profile Picture"
                                                />
                                                {/* COMMENT ARRANGEMENT */}
                                                <View style={{ flex: 1, marginLeft: 10 }}>
                                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                        <Text style={{ fontWeight: "bold" }}>{item.username}</Text>
                                                        <Text style={{ marginLeft: 16, color: "gray" }}>{formatDate(item.created_at)}</Text>
                                                    </View>
                                                    <Text style={{ marginTop: 2 }}>{item.comment}</Text>
                                                </View>

                                            </View>
                                        )}
                                    />
                                )}
                        </View>

                        {/* KEYBOARD SETTINGS?? */}
                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={"height"}
                            keyboardVerticalOffset={Platform.OS === "android" ? 120 : 80}
                        >
                            <View style={styles.userCommentContainer}>
                                <TextInput
                                    style={styles.userComment}
                                    placeholder="Comment..."
                                    placeholderTextColor="gray"
                                    value={newComment}
                                    onChangeText={setNewComment}
                                    multiline
                                />
                                <TouchableOpacity style={styles.sendContainer} onPress={postComments}>
                                    <Feather name="send" size={24} color="white" style={{ margin: 12 }} />
                                </TouchableOpacity>
                            </View>

                        </KeyboardAvoidingView>
                    </BottomSheetView>
                </BottomSheet>
            )}
        </PostContext.Provider>
    )
};

const styles = StyleSheet.create({
    commentContainer: {
        padding: 12,
        flexDirection: "row",
        alignItems: "flex-start",
        borderRadius: 20,
        outlineColor: "black"

    },
    profileAvatar: {
        width: 40,
        height: 40,
        borderRadius: 9999,
    },
    keyboardWrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flex: 1
    },
    userCommentContainer: {
        borderColor: "gray",
        padding: 8,
        backgroundColor: "white",
        color: "black",
        flexDirection: "row",
    },
    userComment: {
        borderColor: "#FF5700",
        borderWidth: 1,
        borderRadius: 20,
        backgroundColor: "white",
        color: "black",
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 8
    },
    sendContainer: {
        borderRadius: 20,
        backgroundColor: "#FF5700",
        paddingHorizontal: 16,
        justifyContent: "center",

    }
})

// to be able to use in other pages
export const usePosts = () => {
    const context = useContext(PostContext);
    if (!context) throw new Error("usePosts must be used within PostProvider");
    return context;
}

