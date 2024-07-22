import { Button, Container, Table, Modal, Form } from "react-bootstrap";
import NavigationBar from "../Components/Navbar";
import DisplayUser from "../Components/DisplayUser";
import { useUserContext } from "../Context/UserContextProvider";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Barcode from 'react-barcode';
import axios from "axios";
import './assets/inventory.css';
import { useZxing } from 'react-zxing';

export default function Inventory({devices}) {
    const { user, loggedIn, token } = useUserContext();
    const [paused, setPaused] = useState(true);
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
    const [editMode, setEditMode] = useState(false);
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [query, setQuery] = useState('');
    const [scan, setScan] = useState(false); // I am using this to monitor the state of the 2nd barcode scan (the one to search)

    const fetchInventory = async () => {
        await axios.get('http://127.0.0.1:8000/api/inventory/', {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then((response) => {
            setInventory(response.data);
            setFilteredInventory(response.data);
        })
        .catch((error) => {
            toast.error('Something went wrong, Could not fetch inventory');
        })
    };

    useEffect(() => {

        if (token) {
            fetchInventory();
        }
    }, [token]);


    const handleFormDataChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const userIsAuthorized = () => {
        return user?.userType?.toLowerCase() === 'manager' || user?.userType?.toLowerCase() === 'admin' || user?.is_superuser;
    };

    const handleAddItem = async () => {
        try {
            await axios.post('http://127.0.0.1:8000/api/inventory/', formData, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });
            toast.success('Item added successfully');
            setShow(false);
            setFormData({
                barcode: '',
                productName: '',
                price: 0,
                quantity: '',
                supplierName: '',
                supplierEmail: '',
            });
            fetchInventory();
        } catch (error) {
            toast.error('Something went wrong, Could not add item');
        }
    };

    const handleDelete = async (barcode) => {
        try {
            await axios.delete('http://127.0.0.1:8000/api/inventory/', {
                headers: {
                    Authorization: `Token ${token}`
                },
                data: {
                    barcode: barcode
                }
            });
            toast.success('Item deleted successfully');
            fetchInventory();
        } catch (error) {
            toast.error('Something went wrong, Could not delete item');
        }
    };

    const { ref } = useZxing({
        deviceId: devices.length > 0 ? devices[0].deviceId : null,
        paused: paused,
        onDecodeResult: (result) => {
            console.log(result);
            if (!scan){
                setFormData({
                    ...formData,
                    barcode: result.text
                })}
            else {
                setQuery(result.text);
            }
            setPaused(true);
        }
    });

    const handleEdit = (item) => {
        console.log(item);
        setFormData({
            id: item.id,
            barcode: item.barcode,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
            supplierName: item.supplierName,
            supplierEmail: item.supplierEmail
        });
        setEditMode(true);
        setShow(true);
    };

    const handleEditItem = async () => {
        console.log(formData);
        await axios.put('http://127.0.0.1:8000/api/inventory/', formData, {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then((response) => {
            toast.success('Item edited successfully');
            setShow(false);
            setEditMode(false);
            setFormData({
                barcode: '',
                productName: '',
                price: 0,
                quantity: '',
                supplierName: '',
                supplierEmail: '',
            });
            fetchInventory();
        })
        .catch((error) => {
            toast.error('Something went wrong, Could not edit item');
        })
    }
    
    const scanBarcode = async () => {
        setScan(true);
        setPaused(false);
    };

    useEffect(() => {
        console.log(query);
        if (query) {
            let newFilteredInventory = inventory.filter((item) => (
                item.productName.toLowerCase().includes(query.toLowerCase()) ||
                item.barcode.toLowerCase().includes(query.toLowerCase()) ||
                item.supplierName.toLowerCase().includes(query.toLowerCase())
            ));
            setFilteredInventory(newFilteredInventory);
            console.log(newFilteredInventory);
        }
       else {
           setFilteredInventory(inventory);
       }
    }, [query]);

    if (!loggedIn) {
        return (
            <Container className="page-container">
                <NavigationBar />
                <h1 className="major-heading">Please login to continue</h1>
            </Container>
        );
    }

    return (
        <Container className="page-container">
            <NavigationBar active="inventory" />
            <Container className="page-container">
                <DisplayUser />
                <h1 className="heading">Inventory</h1>
                {userIsAuthorized() && (
                    <Container className="button-container">
                        <Button variant="warning" className="btn-add" size="md" onClick={() => setShow(true)}>Add Item</Button>
                    </Container>
                )}
                <Container className="search-container">
                    <Form.Control type="text" placeholder="Search Inventory" value={query} onChange={(e) => setQuery(e.target.value)} />
                    {/* <Button variant="success" className="btn-add" size="md" disabled>Search</Button> */}
                    <Button variant="primary" size="md" className="btn-add" onClick={scanBarcode}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-upc-scan" viewBox="0 0 16 16">
                            <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5M.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5M3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0z"/>
                        </svg>
                    </Button>
                </Container>
                {scan && 
                    <Container className="video-container">
                        <video ref={ref} style={{width:'300px'}} />
                        <Container className="button-container">
                            <Button onClick={() => {
                                setScan(false);
                                setPaused(true);
                            }}>Stop Scanning</Button>
                        </Container>
                    </Container>
                }
                <Container className="inventory-table-container">
                    <Table responsive hover striped bordered>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Bar Code</th>
                                <th>Item Name</th>
                                <th>Price (PKR)</th>
                                <th>Stock Quantity</th>
                                <th>Supplier Name</th>
                                <th>Supplier Contact</th>
                                {userIsAuthorized() && <th>Delete</th>}
                                {userIsAuthorized() && <th>Edit</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventory.map((item, index) => (
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
                                    {userIsAuthorized() && (
                                        <td>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(item.barcode)}>
                                                Delete
                                            </Button>
                                        </td>
                                    )}
                                    {userIsAuthorized() && (
                                        <td>
                                            <Button variant="primary" size="sm" onClick={() => handleEdit(item)}>
                                                Edit
                                            </Button>
                                        </td>
                                    )}

                                </tr>
                            ))}
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
                                <Container className="button-container barcode-container">
                                    <Button onClick={() => setPaused(false)}>Scan Barcode</Button>
                                    {!paused && <Button onClick={() => setPaused(true)}>Stop Scanning</Button>}
                                </Container>
                                {
                                    !paused && 
                                        <Container className="video-container">
                                            <video ref={ref} style={{width:'300px', height:'300px'}} />
                                        </Container>
                                }

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
                            {!editMode &&
                            <Button variant="primary" onClick={handleAddItem}>
                                Add
                            </Button>}
                            {
                                editMode &&
                                <Button variant="primary" onClick={handleEditItem}>
                                    Edit
                                </Button>
                            }
                        </Container>
                    </Modal.Footer>
                </Modal>
            </Container>
        </Container>
    );
}
