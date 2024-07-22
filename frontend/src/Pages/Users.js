import { useUserContext } from "../Context/UserContextProvider";
import DisplayUser from "../Components/DisplayUser";
import NavigationBar from "../Components/Navbar";

import {toast, ToastContainer} from "react-toastify";
import { useState, useEffect } from "react";
import { Container, Table, Button, Modal, Form } from "react-bootstrap";
import axios from "axios";

import './assets/users.css';

export default function Users () {
    const [users, setUsers] = useState([]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('');
    const [show, setShow] = useState(false);
    const {user, token, loggedIn} = useUserContext();
    const [editMode, setEditMode] = useState(false);
    const [userName, setUsername] = useState('')
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
    
    const handleCreateUser = async() => {
        await axios.post('http://127.0.0.1:8000/auth/users/', {
            email: email,
            password: password,
            userType: userType
        }, {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then((response)=> {
            console.log(response.data);
            toast.success('User created successfully!');
            setShow(false);
            fetchUsers();
        })
        .catch((error)=> {
            console.log(error);
            if (error?.response?.data?.email) {
                toast.error(error?.response?.data?.email[0]);
            }
            else if (error?.response?.data?.password) {
                toast.error(error?.response?.data?.password[0]);
            }
            else if (error?.response?.data?.userType) {
                toast.error(error?.response?.data?.userType[0]);
            }
            else if (error?.response?.data?.message) {
                toast.error(error?.response?.data?.message);
            }
            else {
                toast.error('Something went wrong!');
            }
        })
    }

    const handleShowEdit = (user) => {
        setUsername(user.username)
        setEmail(user.email)
        setUserType(user.userType)
        setEditMode(true);
        setShow(true);
    }

    const handleEdit = async() => {
        await axios.put('http://127.0.0.1:8000/auth/users/', {
            email: email,
            username: userName,
            userType: userType
        }, {
            headers: {
                Authorization: `Token ${token}`
            },
        })
        .then((response)=> {    
            console.log(response.data);
            toast.success('User updated successfully!');
            fetchUsers();
        })
        .then(() => {
            setEditMode(false);
            setShow(false);
            setUsername('');
            setEmail('');
            setUserType('');
        })
        .catch((error)=> {
            console.log(error);
            toast.error('Something went wrong!');
        })
    }

    const handleClose = () => {
        setShow(false);
        setEditMode(false);
        setUsername('');
        setEmail('');
        setUserType('');
        setPassword('');
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
            <NavigationBar active="users" />
            <Container className="main-content">
                <DisplayUser />
                <h1 className="heading">Users</h1>
                {isUserAdmin() &&
                    <Container className="button-container">
                        <Button variant="warning" className="btn-add" size="lg" onClick={() => setShow(true)}>Add User</Button>
                    </Container>
                }
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
                            {
                                isUserAdmin && <th>Edit</th>
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            users.map((usr, index)=> {
                                return (
                                    <tr key={index}>
                                        <td>{index+1}</td>
                                        <td>{usr.username}</td>
                                        <td>{usr.email}</td>
                                        <td className="userType">{Capitalize(usr.userType)}</td>
                                        {
                                            (isUserAdmin() && usr.userType !== 'admin' || user.is_superuser)  ? 
                                                <td><Button variant="danger" size="sm" onClick={() => hanldeDelete(usr.email)}>Delete</Button></td> : <td></td>
                                        }
                                        {
                                            (isUserAdmin() && usr.userType !== 'admin' || user.is_superuser)  ? 
                                                <td><Button variant="primary" size="sm" onClick={() => handleShowEdit(usr)}>Edit</Button></td> : <td></td>
                                        }
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </Table>
            </Container>
            <Container className="modals">
                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Add User
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control type="email" placeholder="Enter email" disabled={editMode} value={email} onChange={(e) => setEmail(e.target.value)} />
                            </Form.Group>
                            {!editMode && <Form.Group className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                            </Form.Group>}
                            {
                                editMode && <Form.Group className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control type="text" placeholder="Username" value={userName} onChange={(e) => setUsername(e.target.value)}/>
                                </Form.Group>
                            }
                            <Form.Group className="mb-3">
                                <Form.Label>User Type</Form.Label>
                                <Form.Select aria-label="Default select example" value={userType} onChange={(e) => setUserType(e.target.value)}>
                                    <option value="Admin">Admin</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Cashier">Cashier</option>
                                </Form.Select>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Container className="button-container">
                        {
                            !editMode ?
                                <Button variant="warning" type="submit" onClick={handleCreateUser}>
                                    Add User
                                </Button>
                            : 
                                <Button variant="warning" type="submit" onClick={handleEdit}>
                                    Edit User
                                </Button>
                            
                        }
                        </Container>
                    </Modal.Footer>
                </Modal>
            </Container>
        </Container>
    )
}