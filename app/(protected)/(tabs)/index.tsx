import { router } from 'expo-router';
import { View, Text, FlatList, StyleSheet, RefreshControl, Image, Pressable, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import PostCard from '../postCard';
import { usePosts } from '@/utils/postContext';

export default function HomeScreen() {

    // set state for error
    const [error, setError] = useState<string | null>(null);

    // fetches global states from usePosts
    const { posts, refreshPosts, openComments, loading } = usePosts();

    return (
        <View style={{flex: 1, backgroundColor: "#FFF5F0", justifyContent: "center"}}>
            {/* LOADING - while data is being fetched from the db/ backend, display a loading state */}
            {loading ? (
                <View>
                    <View style={{ padding: 20, alignItems: "center" }}>
                        <Text style={{ textAlign: "center" }}>
                            Posts Loading 🐝...
                        </Text>
                        <ActivityIndicator color="#FF5700"/>
                    </View>
                </View>

            ) : (

                <>

                    {error && <Text>{error}</Text>}

                    {/* HOME FEED - This displays the feed/ posts on the home page */}
                    <FlatList
                        data={posts}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            // Individual posts (post cards) are managed in postcard.tsx
                            <PostCard
                                post={item}
                                // handles comment functionality
                                onOpenComments={() => openComments(item)}
                            />
                        )}
                        // pull to refresh page/ reload page
                        refreshControl={
                            <RefreshControl
                                refreshing={false}
                                onRefresh={refreshPosts}
                                colors={['#FF5700']}
                            />
                        }

                    />
                    {/* CHATBOT BUTTON- Bebe the chatbot bee  */}
                    <Pressable
                        onPress={() => router.navigate("/(protected)/chatScreet")}
                        style={styles.chatBotContainer}
                    >
                        <Image
                            style={styles.chatBot}
                            source={require("@/assets/images/aiBot.png")}
                        />
                    </Pressable>

                </>

            )}

        </View>
    );
}

const styles = StyleSheet.create({
    chatBotContainer: {
        position: "absolute",
        bottom: 30,
        right: 0,
        zIndex: 999,
        elevation: 5,
    },
    chatBot: {
        width: 120,
        height: 120
    }
})