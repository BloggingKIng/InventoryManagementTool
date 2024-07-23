import NavigationBar from "../Components/Navbar";
import DisplayUser from "../Components/DisplayUser";

import {Container, Form, Button} from "react-bootstrap";
import { useUserContext } from "../Context/UserContextProvider";
import { useState } from "react";
import { toast } from "react-toastify";
import { useZxing } from "react-zxing";

import axios from "axios";
import './assets/checkout.css';

export default function Checkout({devices}) {
    const {user, loggedIn, token} = useUserContext();
    const [orderItems, setOrderItems] = useState([]);
    const [barcode, setBarcode] = useState('');
    const [paused, setPaused] = useState(true);

    
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
    
    const {ref} = useZxing({
        onDetected: (result) => {
            getItemByBarcode(result.text);
            setPaused(true);
        },
        deviceId: devices.length > 0 && devices[0].deviceId,
        paused: paused,
    });
    const handleScan = () => {
        setPaused((prev) => !prev);
        setBarcode('');
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
                <Container className="video-container">
                    <video ref={ref} style={{width:'300px'}}/>
                </Container>
                <Container className="order-items-container">
                    
                </Container>
            </Container>
        </Container>
    )
}