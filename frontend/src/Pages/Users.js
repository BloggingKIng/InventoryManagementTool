import { Container } from "react-bootstrap";
import { useUserContext } from "../Context/UserContextProvider";
import DisplayUser from "../Components/DisplayUser";
export default function Users () {
    const {user, token} = useUserContext();
    return (
        <Container className="page-container">
            <DisplayUser />
        </Container>
    )
}