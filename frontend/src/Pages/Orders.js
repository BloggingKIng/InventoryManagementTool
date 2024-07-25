import NavigationBar from '../Components/Navbar';
import DisplayUser from '../Components/DisplayUser';

import { Container, Button, Tab } from 'react-bootstrap';
import { useUserContext } from '../Context/UserContextProvider';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import axios from 'axios';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import './assets/orders.css';

const OrderRow = (props) => {
    const {id, orderItems, date, customerName, customerPhone, total, handleDelete, userIsAuthorized, navigate, actualId} = props;
    const [expanded, setExpanded] = useState(false);
    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        size="small"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell align="center">{id}</TableCell>
                <TableCell align="center">{date}</TableCell>
                <TableCell align="center">{customerName}</TableCell>
                <TableCell align="center">{customerPhone}</TableCell>
                <TableCell align="center">PKR {total}</TableCell>
                <TableCell align="center">
                    <Button variant="primary" size="sm" onClick={() => navigate(`/receipt/${actualId(id)}`)}>
                        View Receipt
                    </Button>
                </TableCell>
                {userIsAuthorized() && <TableCell align="center">
                    <Button variant="danger" size="sm" onClick={() => handleDelete(id)}>
                        Delete
                    </Button>
                </TableCell>}
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Order Items
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product Name</TableCell>
                                        <TableCell align="center">Quantity</TableCell>
                                        <TableCell align="center">Unit Price (PKR)</TableCell>
                                        <TableCell align="center">Total Price (PKR)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orderItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell component="th" scope="row">
                                                {item.product.productName}
                                            </TableCell>
                                            <TableCell align="center">{item.quantity}</TableCell>
                                            <TableCell align="center">PKR {item.product.price}</TableCell>
                                            <TableCell align="center">PKR {item.quantity * item.product.price}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    )
}

export default function Orders(){
    const {user, loggedIn, token} = useUserContext();
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

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

    const getActualId = (id) => {
        return (
            id.slice(1)
        )
    }

    const userIsAuthorized = () => {
        return user?.userType?.toLowerCase() === 'admin';
    }

    const handleDelete = async (id) => {
        await axios.delete(`http://127.0.0.1:8000/api/order/`, {
            headers: {
                Authorization: `Token ${token}`
            },
            data: {
                orderId: id
            }
        })
        .then((response) => {
            console.log(response.data);
            toast.success('Order deleted successfully!');
            fetchOrders();
        })
        .catch((error) => {
            console.log(error);
            toast.error('Something went wrong, Could not delete order');
        })
    }

    const columns = [
        { field: 'orderId', headerName: 'Order ID', flex:1, align:'center', headerAlign:'center'},
        { field: 'orderDate', headerName: 'Order Date', flex:1, align:'center', headerAlign:'center'},
        { field: 'customerName', headerName: 'Customer Name', flex:1, align:'center', headerAlign:'center', sortable: false },
        { field: 'customerPhone', headerName: 'Customer Phone', flex:1, align:'center', headerAlign:'center', sortable: false },
        { field: 'totalPrice', headerName: 'Total Price (PKR)', flex:1, align:'center', headerAlign:'center' },
        { field: 'receipt', headerName: 'Receipt', flex:1, align:'center', headerAlign:'center', sortable: false, 
            renderCell: 
                (params)=> {
                    return (
                        <Button 
                            variant='primary' 
                            size='sm'
                            onClick={() => navigate(`/receipt/${getActualId(params.row.orderId)}`)}
                        >
                            Order Receipt
                        </Button>
                    )
                }
        },
        {field: 'delete', headerName: 'Delete', flex:1, align:'center', headerAlign:'center', sortable: false, 
            renderCell: (params)=> {
                return (
                    <Button 
                        variant='danger' 
                        size='sm'
                        onClick={()=>handleDelete(params.row.orderId)}
                    >
                        Delete
                    </Button>
                )
            }
        }
    ]

    const rows = orders.map((order) => ({
        id: order.orderId,
        orderId: order.orderId,
        orderDate: `${new Date(order.orderDate).toLocaleDateString()} ${new Date(order.orderDate).toLocaleTimeString()}`,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        totalPrice: `PKR ${order.total_price}`
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
                    <TableContainer component={Paper}>
                        <Table className='data-grid'>
                            <TableHead>
                                <TableRow>
                                    <TableCell />
                                    <TableCell align="center">Order ID</TableCell>
                                    <TableCell align="center">Order Date</TableCell>
                                    <TableCell align="center">Customer Name</TableCell>
                                    <TableCell align="center">Customer Phone</TableCell>
                                    <TableCell align="center">Total Price (PKR)</TableCell>
                                    <TableCell align="center">Receipt</TableCell>
                                    {userIsAuthorized() && <TableCell align="center">Delete</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders?.map((order) => (
                                    <OrderRow 
                                        key={order.orderId} 
                                        id={order.orderId} 
                                        orderItems={order.products ? order.products : []}  
                                        date={new Date(order.orderDate).toLocaleDateString() + ' ' + new Date(order.orderDate).toLocaleTimeString()} 
                                        customerName={order.customerName} 
                                        customerPhone={order.customerPhone}
                                        total={order.total_price}
                                        handleDelete={handleDelete}
                                        userIsAuthorized={userIsAuthorized}
                                        navigate={navigate}
                                        actualId={getActualId}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Container>
            </Container>
            </Container>
    )
}