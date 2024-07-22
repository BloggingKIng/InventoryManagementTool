import { Button, Container, Table, Modal, Form } from "react-bootstrap";
import NavigationBar from "../Components/Navbar";
import DisplayUser from "../Components/DisplayUser";
import { useUserContext } from "../Context/UserContextProvider";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import './assets/inventory.css';

export default function Inventory (){
    const {user, loggedIn, token} = useUserContext();
    const [inventory, setInventory] = useState([]);
    const [show, setShow] = useState(false);
    const [formData, setFormData] = useState({
        barcode: '',
        productName: '',
        price: 0,
        quantity: '',
        supplierName: '',
        supplierEmail: '',
    });

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

    useEffect(() => {
        if (token){
            fetchInventory();
        }
    }, [token])

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
                            </tr>
                        </thead>
                        <tbody>
                            {
                                inventory.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.barcode}</td>
                                        <td>{item.productName}</td>
                                        <td>{item.price}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.supplierName}</td>
                                        <td>{item.supplierEmail}</td>
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