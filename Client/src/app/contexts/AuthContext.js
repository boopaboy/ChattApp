'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const signUpEndpoint = "https://localhost:5242/api/auth/signup";
    const signInEndpoint = "https://localhost:5242/api/auth/login";
    const defaultValues = { accessToken: null, isAuthenticated: false };
    const [auth, setAuth] = useState(defaultValues);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeUserName, setActiveUserName] = useState('');
    const [activeUserId, setActiveUserId] = useState('');


    const signUp = async (email, username, password) => {
        try {
            const response = await axios.post(signUpEndpoint, { email, username, password });
            
            if (response.status === 200) {
                console.log('Signup successful');
                sessionStorage.setItem('accessToken', response.data.token);
                setAuth({
                    accessToken: response.data.token,
                    isAuthenticated: true,
                });
                setActiveUserId(jwtDecode(response.data.token)["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]);
                setActiveUserName(jwtDecode(response.data.token)["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]);
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('There was an error signing up!', error);
            return false;
        }
    };

    const signIn = async (username, password) => {
        try {
            const response = await axios.post(signInEndpoint, { username, password });
            
            if (response.status === 200) {
                console.log('Login successful');
                sessionStorage.setItem('accessToken', response.data.token);
                setAuth({
                    accessToken: response.data.token,
                    isAuthenticated: true,
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('There was an error logging in!', error);
            return false;
        }
    };

    const signOut = () => {
        sessionStorage.removeItem("accessToken");
        setAuth({
            accessToken: null,
            isAuthenticated: false,
        });
    };

    useEffect(() => {
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
            setAuth({
                accessToken: null,
                isAuthenticated: false,
            });
            setLoading(false);
            return;
        }

        try {
            const decodedToken = jwtDecode(accessToken);
            if (decodedToken.exp * 1000 < Date.now()) {
                console.log("Token expired");
                sessionStorage.removeItem("accessToken");
                setAuth({
                    accessToken: null,
                    isAuthenticated: false,
                });
            setLoading(false);
                return;
            }
            setAuth({
                accessToken: accessToken,
                isAuthenticated: true,
            });
            setLoading(false);

            
        } catch (error) {
            console.error("Error decoding token:", error);
            sessionStorage.removeItem("accessToken");
            setAuth({
                accessToken: null,
                isAuthenticated: false,
            });
  
        }
        setLoading(false);

    }, []);

    return (
        <AuthContext.Provider value={{
            auth,
            signIn,
            signUp,
            signOut,
            error,
            setError,
            activeUserName,
            setActiveUserName,
            activeUserId,
            setActiveUserId,
            loading,

        }}>
            {children}
        </AuthContext.Provider>
    );
};