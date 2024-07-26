import NavigationBar from "../Components/Navbar";
import DisplayUser from "../Components/DisplayUser";
import { useUserContext } from "../Context/UserContextProvider";
import { Container, Button, Table, Modal } from "react-bootstrap";
import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Select from 'react-select';
import './assets/stock-alerts.css';

export default function StockAlerts() {
    const { user, token } = useUserContext();
    const [stockAlerts, setStockAlerts] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [options, setOptions] = useState([]);
    const [show, setShow] = useState(false);
    const [threshold, setThreshold] = useState(0);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const select_all = { value: "select-all", label: "Select All" };

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

    const fetchProducts = async () => {
        await axios.get('http://127.0.0.1:8000/api/inventory/', {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then((response)=> {
            console.log(response.data);
            setInventory(response.data);
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
    const handleSelectChange = (selectedOptions) => {
        if (selectedOptions && selectedOptions.some(option => option.value === select_all.value)) {
            if (selectedProducts.length === options.length - 1) {
                setSelectedProducts([]);
            } else {
                setSelectedProducts(options.filter(option => option.value !== select_all.value));
            }
        } else {
            setSelectedProducts(selectedOptions);
        }
    };

    const handleSubmit = async () => {
        if (selectedProducts.length === 0) {
            toast.error('Please select at least one product!');
            return;
        }
        const selectedPrdsIds = selectedProducts.map(product => product.value);
        await axios.post('http://127.0.0.1:8000/api/stock-alert/', {
                threshold: threshold,
                product_ids: JSON.stringify(selectedPrdsIds)
            },
            {
                headers: {
                    Authorization: `Token ${token}`
                }
            }
        )
        .then((response)=> {
            console.log(response.data);
            getStockAlerts();
            setShow(false);
            toast.success('Stock alert added successfully!');
        })
        .catch((error)=> {
            console.log(error);
            toast.error('Something went wrong!');
        })
    }
    

    useEffect(() => {
        if (token) {
            getStockAlerts();
            fetchProducts();
        }
    }, [token]);
    
    useEffect(() => {
        let opt = [select_all];
        for (let product of inventory) {
            opt.push({value: product.id, label: product.productName});
        }
        setOptions(opt);
    },[inventory]);


    return (
        <Container className="page-container">
            <NavigationBar active="stocks" />
            <DisplayUser />
            <Container>
                <h1 className="heading">Stock Alert Manager</h1>
                <p className="desc">Receive alerts when your inventory is running low!</p>
                <Container className="button-container">
                    <Button variant="primary" onClick={() => setShow(true)}>Add Stock Alert</Button>
                </Container>
                <Container className="alert-container">
                    <Table striped bordered hover>
                        <thead className="text-center">
                            <tr>
                                <th>#</th>
                                <th>Product</th>
                                <th>Threshold</th>
                                <th>Current Inventory</th>
                                <th>Unit Price (PKR)</th>
                                <th>Inventory Value (PKR)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {stockAlerts.map((stockAlert, index) => (
                                <tr 
                                    key={stockAlert.id} 
                                    className={stockAlert.threshold > stockAlert.product.quantity ? 'stock-low' : ''}
                                >
                                    <td>{index + 1}</td>
                                    <td>
                                        {stockAlert.product.productName} 
                                        <strong className="barcode">
                                            ({stockAlert.product.barcode})
                                        </strong>
                                    </td>
                                    <td>{stockAlert.threshold}</td>
                                    <td>{stockAlert.product.quantity}</td>
                                    <td>PKR {stockAlert.product.price}</td>
                                    <td>PKR {stockAlert.product.quantity * stockAlert.product.price}</td>
                                    <td>
                                        <Button variant="danger" onClick={() => handleDelete(stockAlert.id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Container>
            </Container>
            <Container className="modal-container">
                <Modal show={show} onHide={() => setShow(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create Stock Alert</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Container className="alert-container">
                            <Container className="form-group mb-3">
                                <label htmlFor="product">Product</label>
                                <Select
                                    className="select"
                                    options={options}
                                    isMulti
                                    isSearchable={true}
                                    value={selectedProducts}
                                    onChange={handleSelectChange}
                                    id="product"
                                />
                            </Container>
                            <Container className="form-group">
                                <label htmlFor="threshold">Threshold</label>
                                <input type="number" className="form-control" id="threshold" onChange={(e) => setThreshold(e.target.value)} />
                            </Container>
                        </Container>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShow(false)}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            Create Stock Alert
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </Container>
    )
}
