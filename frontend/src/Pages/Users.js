import { useUserContext } from "../Context/UserContextProvider";
import DisplayUser from "../Components/DisplayUser";
import NavigationBar from "../Components/Navbar";

import {toast, ToastContainer} from "react-toastify";
import { useState, useEffect } from "react";
import { Container, Table, Button } from "react-bootstrap";
import axios from "axios";

import './assets/users.css';

export default function Users () {
    const [users, setUsers] = useState([]);
    const {user, token, loggedIn} = useUserContext();
    const fetchUsers = async() => {
        await axios.get('http://127.0.0.1:8000/auth/users/', {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then((response)=> {
            console.log(response.data);
            setUsers(response.data);
        })
        .catch((error)=> {
            console.log(error);
            toast.error('Something went wrong!');
        })
    }

    const Capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    useEffect(() => {
        if (token){
            fetchUsers();
        }
    }, [token])

    const isUserAdmin = () => {
        if (user?.userType === 'admin' || user?.is_superuser) {
            return true;
        }
        return false;
    }

    const hanldeDelete = async(email) => {
        await axios.delete(`http://127.0.0.1:8000/auth/users/`, {
            headers: {
                Authorization: `Token ${token}`
            },
            data: {
                email: email
            }
        })
        .then((response)=> {
            console.log(response.data);
            toast.success('User deleted successfully!');
            fetchUsers();
        })
        .catch((error)=> {
            console.log(error);
            toast.error('Something went wrong!');
        })
    }

    if (!loggedIn) {
        return (
            <Container className="page-container">
                <NavigationBar />
                <h1 className="major-heading">Please login to continue</h1>
            </Container>
        )
    }

    return (
        <Container className="page-container">
            <NavigationBar />
            <ToastContainer />
            <Container className="main-content">
                <DisplayUser />
                <h1 className="heading">Users</h1>
                <Table striped bordered hover className="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>User Type</th>
                            {
                                isUserAdmin() && <th>Delete</th>
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            users.map((user, index)=> {
                                return (
                                    <tr key={index}>
                                        <td>{index+1}</td>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        <td className="userType">{Capitalize(user.userType)}</td>
                                        {
                                            isUserAdmin() && user.userType !== 'admin' ? 
                                                <td><Button variant="danger" size="sm" onClick={() => hanldeDelete(user.email)}>Delete</Button></td> : <td></td>
                                        }
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </Table>
            </Container>
        </Container>
    )
}