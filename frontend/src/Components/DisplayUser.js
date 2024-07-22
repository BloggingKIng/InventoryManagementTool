import { Container } from "react-bootstrap";
import { useUserContext } from "../Context/UserContextProvider";
import './display.css';
export default function DisplayUser() {
    const { user } = useUserContext();
    const Capitalize = (str) => {
        return str?.charAt(0)?.toUpperCase() + str?.slice(1);
    }
    return (
        <Container className="text-center user-container">
            <p>
                <strong>
                    Signed in as: 
                </strong>&nbsp;&nbsp;&nbsp;
                {user?.email} <strong>({Capitalize(user?.userType)})</strong>
            </p>
        </Container>
    )
}