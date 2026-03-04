import { router, Stack, useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable, Image } from "react-native";
import { createApiClient } from '@/services/apiClient';
import { useEffect, useState } from "react";
import PostCard from "./postCard";
import { usePosts } from "@/utils/postContext";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

// the structure of Post object
type Post = {
    _id: string;
    user_id: string;
    username: string;
    body_text: string;
    media_url: string[];
    likes_count: number;
    liked: boolean;
    hobby_tag: string[];
    created_at: string;
};

export default function HobbyPosts() {

    // ------set states-------

    const { hobbyTag } = useLocalSearchParams<{ hobbyTag: string }>();
    const apiClient = createApiClient("json");

    const [selectedHobbyPosts, setSelectedHobbyPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const { posts, refreshPosts, openComments } = usePosts();

    // loads page for specifc hobby (hive) based on hobby tag
    useEffect(() => {
        const fetchHobbyPosts = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/api/v1.0/posts/search?hobby_tag=${hobbyTag}`)
                setSelectedHobbyPosts(response.data)
            } catch (error) {
                console.error("Error fetching hive posts:", error)
            } finally {
                setLoading(false);
            }
        };

        if (hobbyTag) fetchHobbyPosts();

    }, [hobbyTag]);

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: "#FFF5F0" }}>
            <Stack.Screen
                options={{
                    title: 'HivePage',
                    headerTitle: 'HobbyHive',
                    headerTintColor: '#FF5700',
                }}
            />
            <View>

                <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10, alignItems: "center", textAlign: "center" }}>
                    Welcome to the {hobbyTag} hive!
                </Text>
            </View>

            {loading ? (
                <View>
                    <View style={{ padding: 20, alignItems: "center" }}>
                        <Text style={{ textAlign: "center" }}>
                            Posts Loading 🐝...
                        </Text>
                        <ActivityIndicator color="#FF5700" />
                    </View>
                </View>
            ) : selectedHobbyPosts.length > 0 ? (
                <View style={{flex: 1}}>
                    <ScrollView>
                        {selectedHobbyPosts.map((item: Post) => (
                            <PostCard
                                key={item._id}
                                post={item}
                                onOpenComments={() => openComments(item)}
                            />
                        ))}
                    </ScrollView>
                    <Pressable
                        onPress={() => router.navigate("/(protected)/(tabs)/create")}
                        style={styles.createContainer}
                    >
                        <FontAwesome6 name="plus" size={40} color="white" />
                    </Pressable>
                </View>

            ) : (
                <View style={{ flex: 1 }}>
                    <Text style={{ textAlign: "center", marginTop: 20, color: "gray" }}>
                        No posts in this hive yet.{"\n"}Be the first! 🐝
                    </Text>
                    <Pressable
                        onPress={() => router.navigate("/(protected)/(tabs)/create")}
                        style={styles.createContainer}
                    >
                        <FontAwesome6 name="plus" size={40} color="white" />
                    </Pressable>
                </View>

            )}

        </View >
    )
}

const styles = StyleSheet.create({
    createContainer: {
        position: "absolute",
        bottom: 100,
        right: 20,
        zIndex: 999,
        elevation: 5,
        backgroundColor: "#FF5700",
        borderRadius: 50,
        padding: 20
    }
})