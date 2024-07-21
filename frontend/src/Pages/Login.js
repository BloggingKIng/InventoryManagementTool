import { Container, Form, Button } from "react-bootstrap";
import NavigationBar from "../Components/Navbar";
import { useState } from "react";
import { useUserContext } from "../Context/UserContextProvider";
import './login.css';
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { setUser, setToken, setLoggedIn, token, loggedIn } = useUserContext();

    const fetchUser = async(token) => {
        await axios.get('http://127.0.0.1:8000/auth/users/me/', {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then((response)=> {
            setUser(response.data);
            console.log(response.data);
        })
        .catch((error)=> {
            console.log(error);
        })
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        await axios.post('http://127.0.0.1:8000/auth/token/login', {
            email: email,
            password: password,
        })
        .then((response)=> {
            setToken(response.data.auth_token);
            toast.success('Logged in successfully!');
            console.log(response.data.auth_token);
            setLoggedIn(true);
            fetchUser(response.data.auth_token);
            localStorage.setItem('token', response.data.auth_token);
        })
        .catch((error)=> {
            toast.error('Invalid credentials');
            console.log(error);
        })
    }
    
    if (loggedIn){
        return (
            <>
                <NavigationBar active='inventory' />
                <ToastContainer />
                <Container>
                    <h2 className="major-heading">You are logged in!</h2>
                </Container>
            </>
        )
    }

    return (
        <>
            <NavigationBar active='login' />
            <ToastContainer />
            <Container>
                <h2 className="major-heading">Login</h2>
            </Container>
            <Container>
                <Form className="login-form">
                    <Form.Group className="mb-3">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </Form.Group>
                    <Container className="button-container">
                        <Button variant="warning" type="submit" onClick={handleSubmit}>
                            Submit
                        </Button>
                    </Container>
                </Form>
            </Container>
        </>
    )
}

// Will add react router in the next session