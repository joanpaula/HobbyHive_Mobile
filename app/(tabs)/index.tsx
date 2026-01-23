import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';

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
        .then (data => {
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
                renderItem={({ item }) => {

                    const mediaURL = !item.media_url || item.media_url.length === 0 ? ["No Media on this post"] : item.media_url.join(",");

                    return (
                        <View style={styles.container}>
                            <Text>{item.username}</Text>
                            <Text>{item.body_text}</Text>
                            <Text>{mediaURL}</Text>
                            <Text>{item.created_at}</Text>
                        </View>
                    )
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
    backgroundColor: "white",
    outlineColor: "#FF5700",
    outlineWidth: 1,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 12,
    borderRadius: 10,
  }
})