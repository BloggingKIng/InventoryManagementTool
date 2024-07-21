import React from 'react';
import {Container, Navbar, Nav} from 'react-bootstrap';
import './navbar.css';
import { useUserContext } from '../Context/UserContextProvider';
import {toast, ToastContainer} from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function NavigationBar({active='inventory'}) {
    const {user, loggedIn, token, setLoggedIn, setToken, setUser} = useUserContext();
    const navigate = useNavigate();
    const handleLogout = async() => {
        await axios.post('http://127.0.0.1:8000/auth/token/logout',null, {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then((response)=> {
            console.log(response.data.auth_token);
            localStorage.removeItem('token');
            setLoggedIn(false);
            setToken(null);
            setUser([]);
        })
        .catch((error)=> {
            console.log(error);
            toast.error('Something went wrong!');
        })
    }

    const isAuthorizedUser = () => {
        return user?.userType?.toLowerCase() === 'admin' || user?.userType?.toLowerCase() === 'manager';
    }
    return (
        <div className='navbar-container'>
            <Navbar expand="lg" bg='warning'>
                <ToastContainer />
                <Container className='nav-container'>
                    <Navbar.Brand href="/">Inventory Management Tool</Navbar.Brand>
                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                        <Nav className={loggedIn?'':'short-nav'}>
                            <Nav.Link  className={active=='home'?'active':''} href="/">Home</Nav.Link>
                            {loggedIn&&<>
                                <Nav.Link  className={active=='inventory'?'active':''} href="/inventory">Inventory</Nav.Link>
                                <Nav.Link  className={active=='orders'?'active':''} href="/orders">Orders</Nav.Link>
                                <Nav.Link  className={active=='checkout'?'active':''} href="/checkout">Check Out</Nav.Link>
                            
                            </>}
                            {
                                isAuthorizedUser() && <Nav.Link  className={active=='users'?'active':''} href="/users">Users</Nav.Link>
                            }
                            {loggedIn?(
                                <Nav.Item className='btn btn-primary nav-btn' onClick={handleLogout}>Logout</Nav.Item>
                            ):(
                                <Nav.Item  className='btn btn-primary nav-btn' onClick={()=>navigate('/login')}>Login</Nav.Item>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    );
}