import { Button, Container, Nav, Table } from "react-bootstrap";
import { useUserContext } from "../Context/UserContextProvider";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import NavigationBar from "../Components/Navbar";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import './assets/receipt.css';
import DisplayUser from "../Components/DisplayUser";
import { useNavigate } from "react-router-dom";
export default function Receipt() {
    const {id} = useParams(); 
    const {user, loggedIn, token} = useUserContext();
    const [order, setOrder] = useState({});
    const receiptRef = useRef();
    const navigate = useNavigate();

    const fetchOrder = async () => {
        await axios.get(`http://127.0.0.1:8000/api/order/${id}/`, {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then((response) => {
            setOrder(response.data);
            console.log(response.data);
        })
        .catch((error) => {
            console.log(error);
        })
    }

    const handlePrint = useReactToPrint({
        content: () => receiptRef.current,
        documentTitle: `Order ${order.orderId} Receipt`,
    });

    useEffect(() => {
        if (token) {
            fetchOrder();
        }
    }, [token])

    if (!loggedIn) {
        return (
            <Container className='page-container'>
                <NavigationBar active='home' />
                <h1 className='major-heading'>Please login to continue</h1>
            </Container>
        )
    }
    
    return (
        <Container className="page-container">
            <NavigationBar />
            <DisplayUser />
            <Container className="width-controller">
                <Container className="receipt-container" ref={receiptRef}>
                    <h1 className="major-heading brand">Inventory Management Tool</h1>
                    <p className="desc">Thank you for shopping with us!</p>
                    <Container className="details-container">
                        <p>Order ID: <strong>{order.orderId}</strong></p>
                        <p>Customer Name: <strong>{order.customerName}</strong></p>
                        <p>Customer Phone: <strong>{order.customerPhone}</strong></p>
                    </Container>
                    <Container className="receipt">
                        <Table>
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Total Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order?.products?.map((item) => {
                                    return (
                                        <tr>
                                            <td>{item.product.productName}</td>
                                            <td>{item.quantity}</td>
                                            <td>PKR {item.product.price}</td>
                                            <td>PKR {item.product.price * item.quantity}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={3} className="text-end">Total</td>
                                    <td><strong>PKR {order.total_price}</strong></td>
                                </tr>
                            </tfoot>
                        </Table>
                        <p className="date text-center">
                            This receipt was generated on {new Date(order.orderDate).toLocaleDateString()}&nbsp;
                            at {new Date(order.orderDate).toLocaleTimeString()}
                        </p>
                    </Container>
                </Container>
            </Container>
            <Container className="button-container">
                <Button variant="primary" onClick={handlePrint}>Print</Button>
                <Button variant="primary" onClick={() => navigate('/checkout')} >Back to Checkout</Button>
            </Container>
        </Container>
    )
}