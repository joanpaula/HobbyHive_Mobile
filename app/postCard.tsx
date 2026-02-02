import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';

type Post = {
    id?: string;
    user_id: string;
    username: string;
    body_text: string;
    media_url: string[];
    created_at: string;
};

export default function PostCard({ post }: { post: Post }) {

    return (

        <View style={styles.card}>
            <Text style={styles.username}>{post.username}</Text>

            <View>
                <Text style={styles.bodyText}>{post.body_text}</Text>

                {post.media_url.length === 0 ? (
                    <Text style={styles.noMedia}>(No Media on this post)</Text>
                ) : (
                    <Text >{post.media_url.join(",")}</Text>
                )}

            </View>

            <Text style={styles.date}>{post.created_at}</Text>
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
    }
})