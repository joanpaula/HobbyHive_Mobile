import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import PostCard from '../postCard';

export default function HomeScreen() {

    type Post = {
        id?: string;
        user_id: string;
        username: string;
        body_text: string;
        media_url: string[];
        created_at: string;
    };


    const [posts, setPosts] = useState<Post[]>([]);
    const [error, setError] = useState<string | null>(null);
    

    useEffect(() => {
        fetch("http://10.178.12.65:5000/posts")
            .then(res => res.json())
            .then(data => {
                console.log("Posts: ", data);
                setPosts(data);
            })
            .catch(err => {
                console.error(err);
                setError("Failed to load posts");
            });
    }, []);

    return (
        <View>

            {error && <Text>{error}</Text>}

            <FlatList
                data={posts}
                renderItem={({ item }) => <PostCard post={item} />}
            />

            

        </View>
    );
}