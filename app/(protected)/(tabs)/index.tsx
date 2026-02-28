import { useRouter } from 'expo-router';
import { View, Text, FlatList, StyleSheet, RefreshControl, Image } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import PostCard from '../postCard';
import { createApiClient } from '@/services/apiClient';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

export default function HomeScreen() {

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

    const router = useRouter();

    const [posts, setPosts] = useState<Post[]>([]);
    const [error, setError] = useState<string | null>(null);

    const bottomSheetRef = useRef<BottomSheet>(null);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    const [comments, setComments] = useState<Comment[]>([]);

    const apiClient = createApiClient();


    useEffect(() => {
        handleRefresh();
    }, []);

    const handleRefresh = async () => {

        const response = await apiClient.get("/api/v1.0/posts")
        if (response.status) {
            setPosts(response.data)
        } else {
            setError("Failed to refresh posts")
        }
    }

    const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        const day = date.getDate().toString().padStart(2, "0");
        const month = date.toLocaleDateString("default", { month: "numeric" });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const openComments = async (post: Post) => {
        setSelectedPost(post);
        const response = await apiClient.get(`/api/v1.0/posts/${post._id}/comments`)
        setComments(response.data)
        bottomSheetRef.current?.expand()
    }

    return (
        <View>

            {error && <Text>{error}</Text>}

            <FlatList
                data={posts}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        onOpenComments={() => openComments(item)}
                    />)}
                refreshControl={
                    <RefreshControl
                        refreshing={false}
                        onRefresh={handleRefresh}
                        colors={['#FF5700']}
                    />
                }
            />

            {selectedPost && (
                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1}
                    snapPoints={["75%"]}
                    enablePanDownToClose
                    onClose={() => setSelectedPost(null)}
                    backgroundStyle={{borderTopLeftRadius: 30, borderTopRightRadius: 30, outlineColor: "#FF5700", outlineWidth: 2}}
                >
                    <BottomSheetView style={{ flex: 1, paddingTop: 20}}>
                        <Text style={{ textAlign: "center", fontSize: 20 }}>Comments</Text>
                        {comments.length === 0 ? (
                            <Text style={{ marginTop: 2, marginLeft: 10, color: "gray", textAlign: "center" }}>Be the first to comment...</Text>
                        ) :
                            (

                                <FlatList
                                    data={comments}
                                    keyExtractor={(item) => item._id}
                                    renderItem={({ item }) => (
                                        <View style={styles.commentContainer}>

                                            <Image
                                                style={styles.profileAvatar}
                                                source={require("../../../assets/images/1000590504.jpg")}
                                                alt="profile Picture"
                                            />
                                            <View style={{ flex: 1, marginLeft: 10 }}>
                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    <Text style={{ fontWeight: "bold" }}>{item.username}</Text>
                                                    <Text style={{ marginLeft: 16, color: "gray" }}>{formatDate(item.created_at)}</Text>
                                                </View>
                                                <Text style={{ marginTop: 2 }}>{item.comment}</Text>
                                            </View>

                                        </View>
                                        
                                    )}
                                />)}
                    </BottomSheetView>
                </BottomSheet>
            )}

        </View>
    );
}

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
    }
})