import { useContext, createContext, useState } from "react";

const UserContext = createContext();

export default function UserContextProvider ({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    return (
        <UserContext.Provider value={{ user, setUser, token, setToken, loggedIn, setLoggedIn }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUserContext = () => useContext(UserContext)