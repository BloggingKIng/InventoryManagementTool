import { Button, Container, Table, Modal, Form } from "react-bootstrap";
import NavigationBar from "../Components/Navbar";
import DisplayUser from "../Components/DisplayUser";
import { useUserContext } from "../Context/UserContextProvider";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useMediaDevices } from 'react-media-devices';
import { useZxing } from 'react-zxing';
import Barcode from 'react-barcode';
import axios from "axios";
import './assets/inventory.css';

export default function Inventory (){
    const {user, loggedIn, token} = useUserContext();
    const [inventory, setInventory] = useState([]);
    const [deviceId, setDeviceId] = useState(null);
    const [show, setShow] = useState(false);
    const [formData, setFormData] = useState({
        barcode: '',
        productName: '',
        price: 0,
        quantity: '',
        supplierName: '',
        supplierEmail: '',
    });

    const getDevices = async () => {
        try {
            const availableDevices = await navigator.mediaDevices.enumerateDevices();
            const availableVideoDevices = availableDevices.filter(device => device.kind === 'videoinput');
            if (availableVideoDevices.length > 0) {
                return availableVideoDevices;
            }
            toast.error('No video devices found');
            return [];
        } catch (error) {
            toast.error('Error accessing media devices');
            return [];
        }
    };


    const fetchInventory = async() => {
        await axios.get('http://127.0.0.1:8000/api/inventory/', {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then((response)=> {
            setInventory(response.data);
        })
        .catch((error)=> {
            toast.error('Something went wrong, Could not fetch inventory');
        })
    }

    const handleFormDataChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        })
    }

    const userIsAuthorized = () => {
        if (user?.userType?.toLowerCase() === 'manager' || user?.userType?.toLowerCase() === 'admin' || user?.is_superuser) {
            return true;
        }
        return false;
    }

    const handleAddItem = async() => {
        await axios.post('http://127.0.0.1:8000/api/inventory/', formData, {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then((response)=> {
            toast.success('Item added successfully');
            setShow(false);
            fetchInventory();
            setFormData({
                barcode: '',
                productName: '',
                price: 0,
                quantity: '',
                supplierName: '',
                supplierEmail: '',
            })
        })
        .catch((error)=> {
            toast.error('Something went wrong, Could not add item');
        })
    }

    const handleDelete = async(barcode) => {
        await axios.delete(
            'http://127.0.0.1:8000/api/inventory/',
            {
                headers: {
                    Authorization: `Token ${token}`
                }, 
                data: {
                    barcode: barcode
                }
            }
        )
        .then((response)=> {
            toast.success('Item deleted successfully');
            fetchInventory();
        })
        .catch((error)=> {
            toast.error('Something went wrong, Could not delete item');
        })
    }

    useEffect(() => {
        if (token){
            fetchInventory();
        }
        getDevices();
        console.log(getDevices())
    }, [token])

    const { ref } = useZxing({
        onResult(newScan) {
          console.log(newScan);
        },
        deviceId,
        paused:false
    });

    console.log(ref)
    
    

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
            <NavigationBar active="inventory"/>
            <Container className="page-container">
                <DisplayUser />
                <h1 className="heading">Inventory</h1>
                {
                    userIsAuthorized() &&
                        <Container className="button-container">
                            <Button variant="warning" className="btn-add" size="md" onClick={() => setShow(true)}>Add Item</Button>
                        </Container>
                }
                <Container className="inventory-table-container">
                    <Table responsive hover striped bordered>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Bar Code</th>
                                <th>Item Name</th>
                                <th>Price</th>
                                <th>Stock Quantity</th>
                                <th>Supplier Name</th>
                                <th>Supplier Contact</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                inventory.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <Barcode value={item.barcode} height={25} fontSize={20} />
                                        </td>
                                        <td>{item.productName}</td>
                                        <td>{item.price}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.supplierName}</td>
                                        <td>{item.supplierEmail}</td>
                                        <td>
                                            {
                                                userIsAuthorized() && 
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(item.barcode)}>
                                                    Delete
                                                </Button>
                                            }
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </Table>
                </Container>
            </Container>
            <Container>
                <Modal show={show} onHide={() => setShow(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add Item</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Bar Code</Form.Label>
                                <Form.Control type="text" name="barcode" value={formData.barcode} onChange={handleFormDataChange} />
                                <video ref={ref} style={{height: '300px', width: '300px'}} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Item Name</Form.Label>
                                <Form.Control type="text" name="productName" value={formData.productName} onChange={handleFormDataChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Price</Form.Label>
                                <Form.Control type="number" name="price" value={formData.price} onChange={handleFormDataChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Stock Quantity</Form.Label>
                                <Form.Control type="number" name="quantity" value={formData.quantity} onChange={handleFormDataChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Supplier Name</Form.Label>
                                <Form.Control type="text" name="supplierName" value={formData.supplierName} onChange={handleFormDataChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Supplier Email</Form.Label>
                                <Form.Control type="email" name="supplierEmail" value={formData.supplierEmail} onChange={handleFormDataChange} />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Container className="button-container footer">
                            <Button variant="secondary" onClick={() => setShow(false)}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={handleAddItem}>
                                Add
                            </Button>
                        </Container>
                    </Modal.Footer>
                </Modal>
            </Container>
        </Container>
    )
}