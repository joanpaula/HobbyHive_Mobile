import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import PostCard from '../postCard';
import { createApiClient } from '@/services/apiClient';

export default function HomeScreen() {

    type Post = {
        _id: string;
        user_id: string;
        username: string;
        body_text: string;
        media_url: string[];
        created_at: string;
    };


    const [posts, setPosts] = useState<Post[]>([]);
    const [error, setError] = useState<string | null>(null);

    const apiClient = createApiClient();


    useEffect(() => {
        handleRefresh();
    }, []);

    const handleRefresh = async () => {

        const response = await apiClient.get("/posts")
        if (response.status) {
            setPosts(response.data)
        } else {
            setError("Failed to refresh posts")
        }
    }

    return (
        <View>

            {error && <Text>{error}</Text>}

            <FlatList
                data={posts}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => <PostCard post={item} />}
                refreshControl={
                    <RefreshControl
                        refreshing={false}
                        onRefresh={handleRefresh}
                        colors={['#FF5700']}
                    />
                }
            />

        </View>
    );
}