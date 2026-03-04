import { useRouter } from "expo-router";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApiClient } from "@/services/apiClient";
import {jwtDecode} from "jwt-decode"

// auth and user info
const authStorageKey = "auth_token";
const userStorageKey = "user_info";

// the structure of token pay load object
type TokenPayload = {
    sub: string;
    user: string;
    admin: boolean;
    exp: number;
};

// the structure of User tyep object
type UserType = {
    _id: string;
    name: string;
    username: string;
    password: any;
    email: string;
    admin?: boolean;
    created_at: any;
}

// the structure of AuthState object
type AuthState = {
    isLoggedIn: boolean;
    isReady: boolean;
    user: UserType | null;
    logIn: (token: string) => Promise<void>;
    logOut: () => Promise<void>;
};

// to be used in otjee pages
export const AuthContext = createContext<AuthState>({
    isLoggedIn: false,
    isReady: false,
    user: null,
    logIn: async () => {},
    logOut: async () => {}
})

export function AuthProvider({ children }: PropsWithChildren) {

    // set states

    const [isReady, setIsReady] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<UserType | null>(null);

    const router = useRouter();

    const apiClient = createApiClient("json")

    // store logged in user token
    const storeToken = async (token: string | null) => {
        try {
            if (token) {
                await AsyncStorage.setItem(authStorageKey, token)
            } else {
                await AsyncStorage.removeItem(authStorageKey)
            }
        } catch (error) {
            console.log("Error storing token", error)
        }
    };

    // store user data 
    const storeUser = async (userData: any | null) => {
        try {
            if (userData) {
                await AsyncStorage.setItem(userStorageKey, JSON.stringify(userData))
            } else {
                await AsyncStorage.removeItem(userStorageKey)
            }
        } catch (error) {
            console.log("Error storing user info", error)
        }
    };

    // fetching user details
    const fetchUser = async (id: string) => {
        try {
            const response = await apiClient.get(`/api/v1.0/users/${id}`)

            if (response.status) {
                setUser(response.data);
                await storeUser(response.data);
            }
        } catch (error) {
            console.log("Error fecthing user", error)
        }
    };

    // what happes when user is logged in
    const logIn = async (token: string) => {
        await storeToken(token);
        setIsLoggedIn(true);
        const decoded: TokenPayload = jwtDecode(token);
        const userId = decoded.sub;
        await fetchUser(userId);
        router.replace("/(protected)/(tabs)");
    };

    // what happens when user is logged out
    const logOut = async () => {
        setIsLoggedIn(false);
        setUser(null);
        storeToken(null);
        storeUser(null);
        router.replace("/auth/login");
    }

    useEffect(() => {
        const loadAuthState = async () => {
            try {
                const token = await AsyncStorage.getItem(authStorageKey);
                const storedUser = await AsyncStorage.getItem(userStorageKey);

                if (token) {
                    setIsLoggedIn(true);

                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    } else {
                        const decoded: TokenPayload = jwtDecode(token);
                        await fetchUser(decoded.sub);
                    }
                }
            } catch (error) {
                console.log("Error loading auth state", error)
            } finally {
                setIsReady(true);
            }
        };
        loadAuthState();
    }, []);

    return (
        <AuthContext.Provider value={{ isReady, isLoggedIn, user, logIn, logOut }}>
            {children}
        </AuthContext.Provider>
    )
}