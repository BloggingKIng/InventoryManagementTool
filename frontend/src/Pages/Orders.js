import { Container, Table, Button } from 'react-bootstrap';
import NavigationBar from '../Components/Navbar';
import DisplayUser from '../Components/DisplayUser';
import { useUserContext } from '../Context/UserContextProvider';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './assets/orders.css';

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
                    {/* <Table striped bordered hover>
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
                    </Table> */}
                    <DataGrid 
                        className='data-grid' 
                        rows={rows} 
                        columns={columns} 
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 5, page: 0 },
                            },
                            columns: {
                                columnVisibilityModel: {
                                    delete: userIsAuthorized(),
                                }
                            }
                        }}
                        sx={{
                            "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
                               outline: "none !important",
                            },
                         }}
                         disableColumnMenu={true}
                    />
                </Container>
            </Container>
            </Container>
    )
}