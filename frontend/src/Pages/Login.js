import { Container } from "react-bootstrap";
import NavigationBar from "../Components/Navbar";
import './login.css';

export default function Login() {
    return (
        <>
            <NavigationBar active='login' />
            <Container>
                <h2 className="major-heading">Login</h2>
            </Container>
        </>
    )
}

// Will add react router in the next session