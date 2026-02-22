import { View, Text, Platform, StyleSheet, Button, Keyboard } from 'react-native';
import { GoogleMaps, AppleMaps } from 'expo-maps';
import * as Location from 'expo-location';
import { useState, useRef, useEffect } from 'react'
import { createApiClient } from '@/services/apiClient';
import { GoogleMapsMapType } from 'expo-maps/build/google/GoogleMaps.types';
import { Searchbar } from 'react-native-paper';
// import * as Location from 'expo-location';
// import { Button } from '@react-navigation/elements';

type Place = {
    latitude: number
    longitude: number
    name: string
    place_id?: string
}

export default function Places() {

    const apiClient = createApiClient("json")

    const ref = useRef<GoogleMaps.MapView | null>(null);

    const [places, setPlaces] = useState<Place[]>([]);
    const [locationIndex, setLocationIndex] = useState(0);

    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const getCurrentLocation = async () => {

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

    console.log("LOCA LOCA", location?.coords.latitude)
    console.log("LOCA LOCA", location?.coords.longitude)

    const handleSearch = async () => {
        if (!location) {
            console.log("Location not ready");
            Keyboard.dismiss();
            return;
        }

    }

    useEffect(() => {

        if (!searchQuery || searchQuery.length < 2) {
            console.log("Search query too short")
            return;
        }

        const fetchNearbyPlaces = async () => {
            try {
                const res = await apiClient.post("/api/v1.0/search/nearby_places", {
                    lat: location?.coords.latitude,
                    lng: location?.coords.longitude,
                    // lat: 54.602776799512434,
                    // lng: -5.932739211004275,
                    radius: 4000,
                    keyword: searchQuery.trim()
                })
                console.log("DATATTTTTTTTT", res.data)
                setPlaces(res.data)
                console.log("Sending request with:", {
                    lat: location?.coords.latitude,
                    lng: location?.coords.longitude,
                    keyword: searchQuery,
                });
            } catch (err) {
                console.error(err)
            }
        };
        fetchNearbyPlaces();
        // }, [])
    }, [location])

    useEffect(() => {
        if (!places.length) return;

        const currentPlace = places[locationIndex]
        console.log(currentPlace)

        ref.current?.setCameraPosition({
            coordinates: {
                latitude: currentPlace.latitude,
                longitude: currentPlace.longitude
            },
            zoom: 14,
        });

    }, [locationIndex, places])

    const renderMapControls = () => (
        <>
            <View style={{ flex: 8 }} pointerEvents='none' />

            <View style={styles.controlsContainer} pointerEvents='auto'>
                <Button
                    title="Prev"
                    onPress={() => setLocationIndex(prev => Math.max(0, prev - 1))}
                />
                <Button
                    title="Next"
                    onPress={() => setLocationIndex(prev => Math.min(places.length - 1, prev + 1))}
                />
            </View>
        </>
    )

    if (Platform.OS === "ios") {
        return <AppleMaps.View style={{ flex: 1 }} />
    } else if (Platform.OS === "android") {
        return (
            <>
                <View style={{ backgroundColor: "blue", flex: 1 }}>
                    {/* <View style={{ marginHorizontal: 30, marginTop: 10 }}>
                        <Searchbar
                            placeholder="Search"
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                        />
                    </View> */}

                    {/* </View> */}
                    <GoogleMaps.View
                        ref={ref}
                        style={StyleSheet.absoluteFill}
                        // cameraPosition={initialCameraPosition}
                        markers={places.map(p => ({
                            coordinates: {
                                latitude: p.latitude,
                                longitude: p.longitude
                            },
                            title: p.name,
                            // pinColour: idx === locationIndex? "blue":"red"
                        }))}
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
                    />
                    {renderMapControls()}
                    <View style={{ position: "absolute", top: 50, left: 10, right: 10, zIndex: 10 }}>
                        <Searchbar
                            placeholder="Search for hobbies..."
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                            onSubmitEditing={handleSearch}
                        />
                    </View>
                </View>
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
});