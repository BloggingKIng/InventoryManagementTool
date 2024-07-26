import NavigationBar from "../Components/Navbar";
import DisplayUser from "../Components/DisplayUser";
import { useUserContext } from "../Context/UserContextProvider";
import { Container, Button, Table } from "react-bootstrap";
import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import './assets/stock-alerts.css';

export default function StockAlerts() {
    const { user, token } = useUserContext();
    const [stockAlerts, setStockAlerts] = useState([]);

    const getStockAlerts = async () => {
        await axios.get('http://127.0.0.1:8000/api/stock-alert/', {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then((response)=> {
            console.log(response.data);
            setStockAlerts(response.data);
        })
        .catch((error)=> {
            console.log(error);
        })
    }

    const handleDelete = async (id) => {
        await axios.delete(`http://127.0.0.1:8000/api/stock-alert/`, {
            headers: {
                Authorization: `Token ${token}`
            },
            data: {
                stock_id: id
            }
        })
        .then((response)=> {
            console.log(response.data);
            getStockAlerts();
            toast.success('Stock alert deleted successfully!');
        })
        .catch((error)=> {
            console.log(error);
            toast.error('Something went wrong!');
        })
    }

    useEffect(() => {
        if (token) {
            getStockAlerts();
        }
    }, [token])

    return (
        <Container className="page-container">
            <NavigationBar active="stocks" />
            <DisplayUser />
            <Container>
                <h1 className="heading">Stock Alert Manager</h1>
                <p className="desc">Receive alerts when your inventory is running low!</p>
                <Container className="button-container">
                    <Button variant="primary">Add Stock Alert</Button>
                </Container>
                <Container className="alert-container">
                    <Table striped bordered hover>
                        <thead className="text-center">
                            <tr>
                                <th>#</th>
                                <th>Product</th>
                                <th>Threshold</th>
                                <th>Current Inventory</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {stockAlerts.map((stockAlert, index) => (
                                <tr key={stockAlert.id}>
                                    <td>{index + 1}</td>
                                    <td>{stockAlert.product.productName}</td>
                                    <td>{stockAlert.threshold}</td>
                                    <td>{stockAlert.product.quantity}</td>
                                    <td>
                                        <Button variant="danger" onClick={() => handleDelete(stockAlert.id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Container>
            </Container>
        </Container>
    )
}