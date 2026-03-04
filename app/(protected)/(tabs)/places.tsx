import { View, Text, Platform, StyleSheet, Keyboard, ActivityIndicator, Pressable } from 'react-native';
import { GoogleMaps, AppleMaps } from 'expo-maps';
import { useImage } from 'expo-image';
import * as Location from 'expo-location';
import { useState, useRef, useEffect } from 'react'
import { createApiClient } from '@/services/apiClient';
import { GoogleMapsMapType } from 'expo-maps/build/google/GoogleMaps.types';
import { Searchbar } from 'react-native-paper';
import BottomSheet, { BottomSheetFlatList, TouchableOpacity } from '@gorhom/bottom-sheet';
import { AntDesign, Feather } from '@expo/vector-icons';

// the structure of Place object
type Place = {
    latitude: number
    longitude: number
    name: string
    place_id?: string
}

export default function Places() {

    // initialisinh states

    const apiClient = createApiClient("json")

    const ref = useRef<GoogleMaps.MapView | null>(null);

    const [places, setPlaces] = useState<Place[]>([]);
    const [locationIndex, setLocationIndex] = useState(0);

    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");

    const bottomSheetRef = useRef<BottomSheet>(null);

    const [selectedPlaceDetails, setSelectedPlaceDetails] = useState<any>(null);

    // made a custom user marker
    const customPin = useImage(require("@/assets/images/pinMarker.png"))
    const resolvedIcon = customPin ?? undefined


    // on load, get user's current location
    useEffect(() => {
        const getCurrentLocation = async () => {

            // ask for permissiom for user location
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        }

        getCurrentLocation();
    }, []);

    // console.log("LOCA LOCA", location?.coords.latitude)
    // console.log("LOCA LOCA", location?.coords.longitude)

    // function to fetch nearby places based on user's search
    const fetchNearbyPlaces = async () => {
        if (!location || searchQuery.trim().length < 2)
            return;
        try {
            const res = await apiClient.post("/api/v1.0/search/nearby_places", {
                lat: location?.coords.latitude,
                lng: location?.coords.longitude,
                radius: 4000,
                keyword: searchQuery.trim()
            });
            console.log("DATA", res.data)
            setPlaces(res.data)
            console.log("Sending request with:", {
                lat: location?.coords.latitude,
                lng: location?.coords.longitude,
                keyword: searchQuery,
            });
            setLocationIndex(0);
            Keyboard.dismiss();
            bottomSheetRef.current?.snapToIndex(0)
        } catch (err) {
            console.error(err)
        }
    };

    useEffect(() => {
        const target = places.length > 0 ? {
            lat: places[locationIndex].latitude,
            lng: places[locationIndex].longitude
        } : location ? {
            lat: location.coords.latitude,
            lng: location.coords.longitude
        } : null;

        if (!target || !ref.current) return;

        let isMounted = true;

        const moveCameraSafely = async () => {

            if (target && ref.current) {
                try {

                    await new Promise(resolve => setTimeout(resolve, 50));

                    if (isMounted && ref.current) {

                        await (ref.current as any).setCameraPosition
                            // ref.current?.setCameraPosition
                            ({
                                coordinates: {
                                    latitude: target.lat,
                                    longitude: target.lng
                                },
                                zoom: 14,
                                // animate: false
                            });
                    }
                } catch (error) {
                    console.log("Map animation redirected")
                }
            }
        };
        // move map camera on results/ places
        moveCameraSafely();

        return () => {
            isMounted = false;
        }

    }, [location, locationIndex, places]);

    // fetch the details of those nearby places
    const fetchDetails = async (place_id: string) => {
        try {
            // call endpoint
            const response = await apiClient.get(`/api/v1.0/search/nearby_places/${place_id}`)
            setSelectedPlaceDetails(response.data.result)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (places.length > 0 && places[locationIndex].place_id) {
            setSelectedPlaceDetails(null);
            fetchDetails(places[locationIndex].place_id!)
        }
    }, [locationIndex, places])

    // map controls to move camera of result locations
    const renderMapControls = () => (
        <>
            <View style={{ flex: 8 }} pointerEvents='none' />

            <View style={styles.controlsContainer} pointerEvents='auto'>
                <Pressable
                    onPress={() => setLocationIndex(prev => Math.max(0, prev - 1))}
                    style={{backgroundColor: "#FF5700", padding: 15, borderRadius: 15}}
                > 
                    <Text style={{color: "white"}}>PREV</Text>
                </Pressable>
                <Pressable
                    onPress={() => setLocationIndex(prev => Math.min(places.length - 1, prev + 1))}
                    style={{backgroundColor: "#FF5700", padding: 15, borderRadius: 15, marginLeft: 10}}
                >
                    <Text style={{color: "white"}}>NEXT</Text>
                </Pressable>
            </View>
        </>
    )

    // not my OS so will not do it... maybe future work
    if (Platform.OS === "ios") {
        return <AppleMaps.View style={{ flex: 1 }} />
    } else if (Platform.OS === "android") {
        return (
            <>
                <View style={{ backgroundColor: "blue", flex: 1 }}>

                    {/* GOOGLE MAPS RENDERING */}
                    {location && (<GoogleMaps.View
                        ref={ref}
                        style={StyleSheet.absoluteFill}
                        markers={[...(
                            location ? [{
                                coordinates: {
                                    latitude: location.coords.latitude,
                                    longitude: location.coords.longitude
                                },
                                title: "You are here",
                                icon: resolvedIcon,
                                anchor: { x: 0.5, y: 1.0 }

                            }] : []),
                        ...places.map((p, idx) => ({
                            coordinates: {
                                latitude: p.latitude,
                                longitude: p.longitude
                            },
                            title: p.name,
                            pinColour: idx === locationIndex ? "blue" : "red"
                        }))]}
                        properties={{
                            isBuildingEnabled: true,
                            isIndoorEnabled: true,
                            mapType: GoogleMapsMapType.HYBRID,
                            selectionEnabled: true,
                            isMyLocationEnabled: false,
                            isTrafficEnabled: false
                        }}
                        onMarkerClick={(e) => {
                            console.log(
                                JSON.stringify({ type: "onMarkerClick", data: e }, null, 2)
                            );
                        }}
                    />)}
                    <View style={{ position: "absolute", top: 50, left: 10, right: 10, zIndex: 10 }}>
                        {/* SEARCH BAR - for users to search hobbies, produces places near them based on that */}
                        <Searchbar
                            placeholder="Search for hobbies..."
                            placeholderTextColor="gray"
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                            onSubmitEditing={fetchNearbyPlaces}
                            onIconPress={fetchNearbyPlaces}
                            onClearIconPress={() => {
                                setSearchQuery("");
                                setPlaces([]);
                                setLocationIndex(0);
                                bottomSheetRef.current?.close();
                                // bottomSheetRef.current?.snapToIndex(0)
                            }}
                            style={{ borderWidth: 1, elevation: 0, borderColor: "#FF5700", backgroundColor: "white" }}
                            iconColor="#FF5700"
                            rippleColor="#FF5700"
                        />
                    </View>
                    {/* MAPS CONTROL BUTTONS */}
                    {renderMapControls()}
                </View>

                {/* RESULTS PANELS - brings out the results in a button sheet */}
                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1}
                    snapPoints={["50%", "80%"]}
                    enablePanDownToClose
                    backgroundStyle={{ borderTopLeftRadius: 30, borderTopRightRadius: 30, outlineColor: "#FF5700", outlineWidth: 2 }}
                >
                    <View>
                        <Text style={{ textAlign: "center", fontWeight: "500", fontSize: 16 }}>
                            Results for "{searchQuery.trim()}"
                        </Text>
                    </View>

                    <BottomSheetFlatList
                        data={places as Place[]}
                        keyExtractor={(item: Place) => item.place_id || item.name}
                        renderItem={({ item, index }: { item: Place; index: number }) => {

                            const isSelected = index === locationIndex;

                            // arranging the results
                            return (
                                <TouchableOpacity
                                    onPress={() => setLocationIndex(index)}
                                    style={[
                                        styles.itemContainer,
                                        isSelected && styles.itemSelected
                                    ]}
                                >
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                        {/* SELECTED TEXT - highlight selected text */}
                                        {isSelected ? (
                                            <Text style={styles.selectedText}>{item.name}</Text>)
                                            : (<Text style={styles.notSelectedText}>{item.name}</Text>

                                            )}

                                    </View>

                                    {/* SELECTED TEXT DETAILS - brings out the details of the highlighted place */}
                                    {isSelected && (
                                        <View style={styles.detailsContainer}>
                                            {selectedPlaceDetails ? (
                                                <View style={{ gap: 3 }}>
                                                    <View style={styles.badgeRow}>
                                                        <Text style={{ flex: 1, marginBottom: 16 }}>{selectedPlaceDetails.formatted_address}</Text>
                                                        <View style={styles.rating}>
                                                            <AntDesign name="star" size={12} color="white"></AntDesign>
                                                            <Text style={{ marginLeft: 2 }}> {selectedPlaceDetails.rating} / 5</Text>
                                                        </View>
                                                    </View>

                                                    {selectedPlaceDetails.international_phone_number && (
                                                        <View style={styles.detailItem}>
                                                            <Feather name="phone" size={14} />
                                                            <Text style={styles.detailText}>{selectedPlaceDetails.international_phone_number}</Text>
                                                        </View>
                                                    )}

                                                    {selectedPlaceDetails.website && (
                                                        <TouchableOpacity style={styles.detailItem}>
                                                            <Feather name="globe" size={14} color="#FF5700" />
                                                            <Text style={styles.detailText}>{selectedPlaceDetails.website}</Text>
                                                        </TouchableOpacity>
                                                    )}

                                                </View>
                                            ) : (
                                                // Loading when fetching details
                                                <View>
                                                    <Text>Loading details...</Text>
                                                    <ActivityIndicator color="#FF5700"/>
                                                </View>
                                            )}
                                        </View>
                                    )}

                                </TouchableOpacity>
                            )
                        }}
                    >

                    </BottomSheetFlatList>
                </BottomSheet>

            </>
        )
    } else {
        return <Text>Maps are only available on Android and iOS</Text>
    }
}
const styles = StyleSheet.create({
    controlsContainer: {
        position: "absolute",
        bottom: 50,
        left: 0,
        right: 0,
        flexDirection: "row",
        zIndex: 10,
        padding: 8,
        borderRadius: 10
    },
    itemContainer: {
        marginHorizontal: 20,
        marginVertical: 10,
        padding: 1,
        borderRadius: 15
    },
    itemSelected: {
        marginHorizontal: 20,
        marginVertical: 10,
        padding: 1,
        borderRadius: 15
    },
    selectedText: {
        flex: 1,
        fontSize: 14,
        fontWeight: "400",
        color: "#FF5700"
    },
    notSelectedText: {
        flex: 1,
        fontSize: 14,
        fontWeight: "400",
        color: "black"
    },
    badgeRow: {
        alignItems: "flex-start",
        marginBottom: 8
    },
    rating: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFB800",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        marginRight: 8
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6
    },
    detailText: {
        color: "#444",
        marginLeft: 8
    },
    detailsContainer: {
        backgroundColor: "white",
        marginTop: 10,
        padding: 10,
        borderWidth: 2,
        borderColor: "#FF5700",
        borderRadius: 10
    }
});