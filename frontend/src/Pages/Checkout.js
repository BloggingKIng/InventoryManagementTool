import NavigationBar from "../Components/Navbar";
import DisplayUser from "../Components/DisplayUser";

import { Container, Form, Button, Table } from "react-bootstrap";
import { useUserContext } from "../Context/UserContextProvider";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { useZxing } from "react-zxing";
import { useReactToPrint } from 'react-to-print';

import axios from "axios";
import './assets/checkout.css';

export default function Checkout({devices}) {
    const {user, loggedIn, token} = useUserContext();
    const [orderItems, setOrderItems] = useState([]);
    const [barcode, setBarcode] = useState('');
    const [paused, setPaused] = useState(true);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [checkingOut, setCheckingOut] = useState(false);
    const receiptRef = useRef();

    
    const getItemByBarcode = async (barcode) => {
        if (!barcode) {
            return;
        }

        if (orderItems.some(item => item.barcode === barcode)) {
            toast.error('This product is already in your order');
            return;
        }

        await axios.get(`http://127.0.0.1:8000/api/inventory/${barcode}/`, {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then((response) => {
            setOrderItems([...orderItems, {...response.data, purchaseQuantity: 1}]);
        })
        .catch((error) => {
            console.log(error);
            toast.error('A product with that barcode does not exist in our inventory'); 
        })
        
    }

    const removeItem = (barcode) => {
        setOrderItems(orderItems.filter((item) => item.barcode !== barcode));
    }
    
    const {ref} = useZxing({
        onDecodeResult: (result) => {
            getItemByBarcode(result.text);
        },
        deviceId: devices.length > 0 && devices[0].deviceId,
        paused: paused,
        timeBetweenDecodingAttempts: 1,
    });
    const handleScan = () => {
        setPaused((prev) => !prev);
        setBarcode('');
    }

    const handleQuantityChange = (item, quantity) => {
        console.log(quantity);

        if (quantity <= 0 && quantity) {
            removeItem(item.barcode);
            return;
        }
        setOrderItems(orderItems.map((orderItem) => {
            if(orderItem.barcode === item.barcode) {
                return {...orderItem, purchaseQuantity: quantity};
            }
            return orderItem;
        }));
    }

    const validateQuantity = (item, quantity) => {
        if (quantity <= 0 || !quantity) {
            removeItem(item.barcode);
            return;
        }
    }
    
    const handlePrint = useReactToPrint({
        content: () => receiptRef.current,
    });

    const handleCancelCheckout = () => {
        setOrderItems([]);
        setCustomerName('');
        setCustomerPhone('');
        setPaused(true);
    }

    const handleCheckout = async () => {
        if (!customerName || !customerPhone) {
            toast.error('Cusomer\'s name and phone number are required');
            return;
        }

        if (orderItems.length === 0) {
            toast.error('There are no items to order');
            return;
        }

        setCheckingOut(true);

        let productData = {}
        for (let item of orderItems) {
            productData[item.id] = item.purchaseQuantity;
        }
        
        console.log(productData);

        await axios.post('http://127.0.0.1:8000/api/order/', {
            customer_name: customerName,
            customer_phone: customerPhone,
            order_items: JSON.stringify(productData)
        }, {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then((response) => {
            toast.success('Checkout successful');
            handlePrint();
            setOrderItems([]);
            setCustomerName('');
            setCustomerPhone('');
            setCheckingOut(false);
            setPaused(true);
        })
        .catch((error) => {
            console.log(error);
            toast.error('Something went wrong while checking out, please try again');
            setCheckingOut(false);
        })
    }


    if(!loggedIn){
        return (
            <Container className="page-container">
                <NavigationBar active='checkout' />
                <h1 className="text-center major-heading">You need to be logged in to access this page</h1>
            </Container>
        )
    }

    return (
        <Container className="page-container">
            <NavigationBar active='checkout' />
            <Container>
                <DisplayUser />
                <h1 className="heading">Checkout</h1>
                <p className="text-center">(Checkout Page)</p>
                <Container className="form-container">
                    <Form.Control type="text" placeholder="Enter barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
                    <Container className="btn-container">
                        <Button variant="success" size="md" onClick={() => getItemByBarcode(barcode)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
                            </svg>
                        </Button>
                        <Button variant="primary" size="md" className="btn-add" onClick={handleScan}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-upc-scan" viewBox="0 0 16 16">
                                <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5M.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5M3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0z"/>
                            </svg>
                        </Button>
                    </Container>
                </Container>
                <Container className={paused ? 'video-container d-none' : 'video-container'}>
                    <video ref={ref} style={{width:'300px'}}/>
                </Container>
                <Container className="order-items-container mt-3">
                    <h2 className="heading">Order Items</h2>
                    <Container className="order-items" ref={receiptRef}>
                        {checkingOut && <Container>
                            <h1 className="heading">Inventory Management Tool</h1>
                            <h2 className="heading">(Order Summary)</h2>
                        </Container>}
                        <Table striped bordered hover >
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Item Name</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total Price</th>
                                    {!checkingOut && <th>Remove</th>}
                                </tr>   
                            </thead>
                            <tbody>
                                {orderItems.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.productName}</td>
                                        <td>
                                            {!checkingOut && <Form.Control type="number" className="quantity-number" 
                                                value={item.purchaseQuantity} 
                                                onChange={(e) => handleQuantityChange(item, e.target.value)} 
                                                onBlur={(e) => validateQuantity(item, e.target.value)}
                                            />}
                                            {
                                                checkingOut && <strong>{item.purchaseQuantity}</strong>
                                            }
                                        </td>
                                        <td>{item.price}</td>
                                        <td>PKR {item.purchaseQuantity * item.price}</td>
                                        {!checkingOut && <td>
                                            <Button variant="danger" size="sm" onClick={() => removeItem(item.barcode)}>
                                                Remove
                                            </Button>
                                        </td>}
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={2}>
                                        Cashier: {user.username} ({user.email})
                                    </td>
                                    <td colSpan={2} className="text-end">Total</td>
                                    <td>
                                        <strong>
                                            PKR {orderItems.reduce((total, item) => total + item.purchaseQuantity * item.price, 0)}
                                        </strong>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={3}>
                                        <strong>
                                            Customer Name: {customerName}
                                        </strong>
                                    </td>
                                    <td colSpan={3}>
                                        <strong>
                                            Customer Phone: {customerPhone}
                                        </strong>
                                    </td>
                                </tr>
                            </tfoot>
                        </Table>
                    </Container>
                    <Container className="customer-info">
                        <h2 className="heading">Customer Info</h2>
                        <Container className="customer-form-container">
                            <Form.Group>
                                <Form.Label>Customer Name</Form.Label>
                                <Form.Control type="text" placeholder="Enter Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                            </Form.Group>
                            <Form.Group>    
                                <Form.Label>Customer Phone</Form.Label>
                                <Form.Control type="phone" placeholder="Enter Customer's Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                            </Form.Group>
                        </Container>
                    </Container>
                </Container>
                <Container className="button-container">
                    <Button variant="danger" onClick={handleCancelCheckout}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleCheckout}>
                        Checkout
                    </Button>
                </Container>
            </Container>
        </Container>
    )
}