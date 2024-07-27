import React, { useState, useEffect } from 'react';
import {Container, Navbar, Nav, Dropdown} from 'react-bootstrap';
import './navbar.css';
import { useUserContext } from '../Context/UserContextProvider';
import {toast, ToastContainer} from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ReadEnvelope = () => {
    return (
        <Container  className='icon-container'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-envelope" viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>
            </svg>
        </Container>
    )
}

const UnReadEnvelope = () => {
    return (
        <Container  className='icon-container'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-envelope-open" viewBox="0 0 16 16">
                <path d="M8.47 1.318a1 1 0 0 0-.94 0l-6 3.2A1 1 0 0 0 1 5.4v.817l5.75 3.45L8 8.917l1.25.75L15 6.217V5.4a1 1 0 0 0-.53-.882zM15 7.383l-4.778 2.867L15 13.117zm-.035 6.88L8 10.082l-6.965 4.18A1 1 0 0 0 2 15h12a1 1 0 0 0 .965-.738ZM1 13.116l4.778-2.867L1 7.383v5.734ZM7.059.435a2 2 0 0 1 1.882 0l6 3.2A2 2 0 0 1 16 5.4V14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V5.4a2 2 0 0 1 1.059-1.765z"/>
            </svg>
        </Container>
    )
}

export default function NavigationBar({active='inventory'}) {
    const {user, loggedIn, token, setLoggedIn, setToken, setUser} = useUserContext();
    const [alerts, setAlerts] = useState([]);
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

    const fetchAlerts = () => {
        axios.get('http://127.0.0.1:8000/api/user/alerts/', {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then((response)=> {
            setAlerts(response.data);
        })
        .catch((error)=> {
            console.log(error);
        })
    }

    const changeStatus = async(e, id, read) => {
        console.log(id);
        e.stopPropagation();
        const targetAlert = alerts.find((alert)=> alert.id === id);
        await axios.put(`http://127.0.0.1:8000/api/user/alerts/`, {
            seen: read === true,
            id: id
        }, {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then((response)=> {
            console.log(response.data);
            setAlerts((prev) => {
                const index = prev.findIndex((alert) => alert.id === id);
                if (index === -1) return prev; 
            
                return [
                    ...prev.slice(0, index),
                    { ...prev[index], seen: !prev[index].seen },
                    ...prev.slice(index + 1)
                ];
            });        
        })
        .catch((error)=> {
            console.log(error);
        })
    }

    const handleDeleteAlert = async(e, id) => {
        e.stopPropagation();
        await axios.delete(`http://127.0.0.1:8000/api/user/alerts/`, {
            headers: {
                Authorization: `Token ${token}`
            },
            data: {
                id: id
            }
        })
        .then((response)=> {
            console.log(response.data);
            fetchAlerts();
            toast.success('Alert deleted successfully!');
        })
        .catch((error)=> {
            console.log(error);
            toast.error('Something went wrong!');
        })
    }

    useEffect(() => {
        if (token) {
            fetchAlerts();
        }
    }, [token])


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
                                        {
                                            alerts.length > 0 ?
                                                alerts.map((alert)=> {
                                                    return (
                                                        <Dropdown.Item as={'div'} className={alert.seen ? 'read' : 'unread'}>

                                                            <span  onClick={(e) => changeStatus(e,alert.id, !alert.seen)}>
                                                                {alert.seen ? <ReadEnvelope /> : <UnReadEnvelope  />}
                                                            </span>
                                                            <span>
                                                                {alert.content}
                                                                <Container className='delete' onClick={(e) => handleDeleteAlert(e, alert.id)}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                                                                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                                                                    </svg>
                                                                </Container>
                                                            </span>
                                                        </Dropdown.Item>
                                                    )
                                                })
                                                :
                                            <Dropdown.Item as={'div'} className='no-notifications'>
                                                <span>
                                                    No new alerts
                                                </span>
                                            </Dropdown.Item>
                                        }
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