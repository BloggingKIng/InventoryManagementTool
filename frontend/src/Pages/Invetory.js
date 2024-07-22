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

    const fetchInventory = async () => {
        await axios.get('http://127.0.0.1:8000/api/inventory/', {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then((response) => {
            setInventory(response.data);
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
            setFormData({
                ...formData,
                barcode: result.text
            })
            setPaused(true);
        }
    });

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
                            {inventory.map((item, index) => (
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
                                        {userIsAuthorized() && (
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(item.barcode)}>
                                                Delete
                                            </Button>
                                        )}
                                    </td>
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
                            <Button variant="primary" onClick={handleAddItem}>
                                Add
                            </Button>
                        </Container>
                    </Modal.Footer>
                </Modal>
            </Container>
        </Container>
    );
}
