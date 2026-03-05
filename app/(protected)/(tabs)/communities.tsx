import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { createApiClient } from '@/services/apiClient';
import { useEffect, useState } from 'react';
import { Searchbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { black } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';

// the structure of Hobby object
type Hobby = {
    _id: string;
    hobby: string;
}

export default function Communities() {

    const router = useRouter();

    const apiClient = createApiClient("json");

    const [hobbies, setHobbies] = useState<Hobby[]>([]);

    const [searchQuery, setSearchQuery] = useState("");

    const [loading, setLoading] = useState(true);

    // remove trailing spaces and send lowercase search query
    const filterHobbies = hobbies.filter(h =>
        h.hobby.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    // on load, display a list of hobbies
    useEffect(() => {

        const displayHobbies = async () => {
            // load while hobbies are fetching
            setLoading(true);
            try {
                // call api to fetch hobbies
                const response = await apiClient.get(`/api/v1.0/hobbies`)
                setHobbies(response.data)
            } catch (error) {
                console.log("Error fetchig hobbies:", error)
            } finally {
                // stop loading after fetching hobbies
                setLoading(false);
            }
        }
        displayHobbies();
    }, [])

    // when you click on specific hobby, redirect to the specic hobby page
    const selectedHobbyPage = (hobby: string) => {
        router.push({
            pathname: "/(protected)/hobbyPost",
            params: {hobbyTag: hobby}
        })
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#FFF5F0" }}>
            <View style={{ padding: 16 }}>
                {/* SEARCH BAR - searches through the list of hobbies (hives) */}
                <Searchbar
                    placeholder="Where's your hive?"
                    placeholderTextColor="gray"
                    onChangeText={setSearchQuery}
                    inputStyle={{color: "black"}}
                    value={searchQuery}
                    onClearIconPress={() => {
                        setSearchQuery("");
                        Keyboard.dismiss();
                    }}
                    style={{ borderWidth: 1, elevation: 0, borderColor: "#FF5700", backgroundColor: "white" }}
                    iconColor="#FF5700"
                    rippleColor="#FF5700"
                    loading={loading}
                />
            </View>
            <ScrollView>
                {/* LOADING - while fetching, display loading */}
                {loading ? (
                    <Text
                        style={{ textAlign: "center", marginTop: 20 }}
                    >
                        Gathering the Hives 🐝...
                    </Text>
                ) :
                    filterHobbies.length > 0 ? (
                        // fileting through a list of hobbies
                        filterHobbies.map((hobbyObj) => (
                            <TouchableOpacity 
                            key={hobbyObj._id} 
                            style={styles.card}
                            // when you click on hive, move to a dedicated hive page
                            onPress={() => selectedHobbyPage(hobbyObj.hobby)}
                            >
                                <Text style={{ textAlign: "center", fontWeight: "500", fontSize: 16 }}>
                                    {hobbyObj.hobby}
                                </Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        // if the search doesnt match any of the hives, return this
                        <Text style={{ textAlign: "center", marginTop: 20, color: "gray" }}>
                            No results found for "{searchQuery}" {"\n"}
                            Let's find you a different hive 🐝
                        </Text>
                    )}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "white",
        borderColor: "#FF5700",
        borderWidth: 1,
        padding: 12,
        marginVertical: 8,
        marginHorizontal: 12,
        borderRadius: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
})