import { Container, Table } from 'react-bootstrap';
import NavigationBar from '../Components/Navbar';
import DisplayUser from '../Components/DisplayUser';
import { useUserContext } from '../Context/UserContextProvider';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';

export default function Orders(){
    const {user, loggedIn, token} = useUserContext();
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        await axios.get('http://127.0.0.1:8000/api/order/', {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then((response) => {
            setOrders(response.data);
            console.log(response.data);
        })
        .catch((error) => {
            console.log(error);
        })
    }

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token])

    const columns = [
        { field: 'orderId', headerName: 'Order ID', width: '100' },
        { field: 'orderDate', headerName: 'Order Date', width: 220 },
        { field: 'customerName', headerName: 'Customer Name', width: 150 },
        { field: 'customerPhone', headerName: 'Customer Phone', width: 150 },
        { field: 'totalPrice', headerName: 'Total Price', width: 150 },
    ]

    const rows = orders.map((order) => ({
        id: order.orderId,
        orderId: order.orderId,
        orderDate: `${new Date(order.orderDate).toLocaleDateString()} ${new Date(order.orderDate).toLocaleTimeString()}`,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        totalPrice: order.total_price
    }))

    
    if (!loggedIn) {
        return (
            <Container className='page-container'>
                <NavigationBar active='orders'/>
                <h1 className='major-heading'>Please login to continue</h1>
            </Container>
        )
    }

    return (
        <Container className='page-container'>
            <NavigationBar active='orders'/>
            <DisplayUser />
            <Container>    
                <h1 className='heading'>Orders</h1>
                <Container className='orders-container'>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Order Date</th>
                                <th>Customer Name</th>
                                <th>Customer Phone</th>
                                <th>Total price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.orderId}>
                                    <td>{order.orderId}</td>
                                    <td>
                                        {new Date(order.orderDate).toLocaleDateString()}&nbsp;
                                        {new Date(order.orderDate).toLocaleTimeString()}
                                    </td>
                                    <td>{order.customerName}</td>
                                    <td>{order.customerPhone}</td>
                                    <td>PKR {order.total_price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Container>
            </Container>
            </Container>
    )
}