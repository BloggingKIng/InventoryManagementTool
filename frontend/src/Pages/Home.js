import NavigationBar from "../Components/Navbar";
import DisplayUser from "../Components/DisplayUser";
import { Container } from "react-bootstrap";
import { useUserContext } from "../Context/UserContextProvider";
import { useNavigate } from "react-router-dom";
import './assets/home.css';
export default function Home() {{
    const {loggedIn} = useUserContext();
    const navigate = useNavigate();
    return (
        <Container className="page-container">
            <NavigationBar active='home' />
            {loggedIn ? <DisplayUser /> : (
                <h2 className="major-heading">Please login to continue</h2>
            )}
        </Container>
    )
}}

//I dont have any more idea about this page lol. Will complpete its design later :>