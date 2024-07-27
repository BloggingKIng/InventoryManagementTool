import React from 'react';
import {Container, Navbar, Nav, Dropdown} from 'react-bootstrap';
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
                        <Nav className={loggedIn?isAuthorizedUser()?'navbar-nav-admin':'navbar-nav':'short-nav'}>
                            <Nav.Link  className={active=='home'?'active':''} href="/">Home</Nav.Link>
                            {loggedIn&&<>
                                <Nav.Link  className={active=='inventory'?'active':''} href="/inventory">Inventory</Nav.Link>
                                <Nav.Link  className={active=='orders'?'active':''} href="/orders">Orders</Nav.Link>
                                <Nav.Link  className={active=='checkout'?'active':''} href="/checkout">Check Out</Nav.Link>
                                
                            </>}
                            {
                                isAuthorizedUser() && <Nav.Link  className={active=='users'?'active':''} href="/users">Users</Nav.Link>
                            }
                            {
                                isAuthorizedUser() && <Nav.Link  className={active=='stocks'?'active':''} href="/stock-alerts">Stock Alerts</Nav.Link>
                            }
                            <Nav.Item className='notifications-button'>
                                <Dropdown>
                                    <Dropdown.Toggle className='dropdown-btn'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-bell" viewBox="0 0 16 16">
                                        <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"/>
                                    </svg>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className='notifications-container'>
                                        <Dropdown.Item>Stock of Item X has fallen below the limit. Take a look at the stock!</Dropdown.Item>
                                        <Dropdown.Item>Another action</Dropdown.Item>
                                        <Dropdown.Item>Something else</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Nav.Item>
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