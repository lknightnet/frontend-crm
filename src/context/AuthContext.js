// src/context/AuthContext.js
import {createContext, useContext, useEffect, useState} from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
        const [access, setAccess] = useState(localStorage.getItem("access_token"));
        const [refresh, setRefresh] = useState(localStorage.getItem("refresh_token"));
        const [user, setUser] = useState(null);

    const authFetch = async (url, options = {}) => {
        // Первая попытка с текущим access токеном
        let response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${access}`,
            },
        });

        if (response.status === 401) {
            const clone = response.clone();
            const data = await clone.json();

            if (data.error === "token has expired" && refresh) {
                try {
                    // Попытка обновления токена
                    const refreshResponse = await fetch("http://crm-auth-service-1:8008/api/auth/refresh", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ refresh_token: refresh }),
                    });

                    if (!refreshResponse.ok) {
                        throw new Error("Не удалось обновить токен");
                    }

                    const refreshData = await refreshResponse.json();
                    login(refreshData.access_token, refreshData.refresh_token);

                    // Повторная попытка запроса с новым access токеном
                    response = await fetch(url, {
                        ...options,
                        headers: {
                            ...options.headers,
                            Authorization: `Bearer ${refreshData.access_token}`,
                        },
                    });
                } catch (err) {
                    logout();
                    throw err;
                }
            }
        }

        return response;
    };

        useEffect(() => {
            if (access) {
                authFetch("http://crm-user-service-1:8010/api/user/get", {
                    method: "GET",
                })
                    .then(res => res.json())
                    .then(data => setUser(data))
                    .catch(() => setUser(null));
            }
        }, [access]);


        const login = (newAccess, newRefresh) => {
            localStorage.setItem("access_token", newAccess);
            localStorage.setItem("refresh_token", newRefresh);
            setAccess(newAccess);
            setRefresh(newRefresh);
        };

        const logout = () => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            setAccess(null);
            setRefresh(null);
            setUser(null);
        };

        return (
            <AuthContext.Provider value={{access, refresh, user, login, logout, authFetch}}>
                {children}
            </AuthContext.Provider>
        );
    }
;

export const useAuth = () => useContext(AuthContext);
