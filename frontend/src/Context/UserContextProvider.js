import { useContext, createContext, useState } from "react";

const UserContext = createContext();

export default function UserContextProvider ({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    return (
        <UserContext.Provider value={{ user, setUser, token, setToken }}>
            {children}
        </UserContext.Provider>
    );
}

const useUserContext = () => useContext(UserContext)