import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { MenuProvider, Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

type Post = {
    _id: string;
    user_id: string;
    username: string;
    body_text: string;
    media_url: string[];
    created_at: string;
};

export default function PostCard({ post }: { post: Post }) {

    const deletePost = async (postId: string) => {
            try {
                const response = await fetch(`http://10.178.12.65:5000/posts/${postId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    console.error("Failed to delete post:", await response.text());
                    return;
                } else{
                    console.log("Post deleted successfully");
                }
                
            } catch (error) {
                console.error("Error deleting post:", error);
            }
        }

    return (

        <View style={styles.card}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                <Text style={styles.username}>{post.username}</Text>

                    <Menu>
                        <MenuTrigger>
                            <Text style={{fontSize: 18, padding: 8}}>⋮</Text>
                        </MenuTrigger>

                        <MenuOptions>

                            <MenuOption onSelect={() => alert(`Edit ${post._id}`)}>
                                <Text style={styles.option}>Edit</Text>
                            </MenuOption>

                            <MenuOption onSelect={() => { alert("deleted " + post._id); deletePost(post._id); }}>
                                <Text style={styles.option}>Delete</Text>
                            </MenuOption>

                        </MenuOptions>
                    </Menu>
                

            </View>

            <View>
                <Text style={styles.bodyText}>{post.body_text}</Text>

                {(post.media_url || []).length === 0 ? (
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
    },
    option: {
        padding: 10,
        fontSize: 16,
    },


})

const triggerStyles = {
    menuTrigger: {
        color: 'white',
        fontSize: 16
    },
    triggerWrapper: {
        padding: 10,
        borderRadius: 5
    }
}