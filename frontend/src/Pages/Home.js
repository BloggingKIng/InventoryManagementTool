import NavigationBar from "../Components/Navbar";
import DisplayUser from "../Components/DisplayUser";
import { Container, Table, Form, Button } from "react-bootstrap";
import { useUserContext } from "../Context/UserContextProvider";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import './assets/home.css';
import axios from "axios";
import { toast } from "react-toastify";
import Select from 'react-select';

export default function Home() {
    const {loggedIn, token, user} = useUserContext();

    const [stats, setStats] = useState({});
    const [statsTimeRange, setStatsTimeRange] = useState({value: 'today', label: 'Today'});
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const userIsAuthorized = () => {
        return user?.userType?.toLowerCase() === 'admin' ||  user?.userType?.toLowerCase() === 'manager';
    }

    const fetchStats = async() =>  {
        await axios.get('http://127.0.0.1:8000/api/sales/', {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then((response) => {   
            setStats(response.data);
            console.log(response.data);
        })
        .catch((error) => {
            toast.error('Failed to fetch stats');
        });
    }

    useEffect(() => {
        if (token) {
            fetchStats();
        }
    }, [token])

    const filteredProducts = stats.product_data?.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.barcode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Container className="page-container">
            <NavigationBar active='home' />
            {loggedIn ? <DisplayUser /> : (
                <h2 className="major-heading">Please login to continue</h2>
            )}
            {
                userIsAuthorized() && 
                    (
                        <Container>
                            <h2 className="top-heading heading">Statistics</h2>
                            <Container className="stats-timerange">
                                <Select 
                                    options={
                                        [
                                            {label: 'Today', value: 'today'},
                                            {label: 'This Week', value: 'week'},
                                            {label: 'This Month', value: 'month'},
                                            {label: 'All Time', value: 'all'}
                                        ]
                                    }
                                    defaultValue={{value: 'today', label: 'Today'}}
                                    value={statsTimeRange}
                                    onChange={(e) => setStatsTimeRange(e)}
                                />
                            </Container>
                            <Container className="overall-stats">
                                <Container className="icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" class="bi bi-graph-up" viewBox="0 0 16 16">
                                        <path fill-rule="evenodd" d="M0 0h1v15h15v1H0zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07"/>
                                    </svg>
                                </Container>
                                <Container className="stats">
                                    <Container className="heading-container">
                                        <h2 className="stats-heading">{statsTimeRange.label} Sales Report</h2>
                                    </Container>
                                    <Container className="stats-container">
                                        <Container className="stat">
                                            <h3 className="stat-heading">Total Products Sold</h3>
                                            <p className="stat-value">
                                                {
                                                    statsTimeRange.value === 'today' ?
                                                    (stats.sales_today ? stats.sales_today : 0) : statsTimeRange.value === 'week' ?
                                                    (stats.sales_in_7_days ? stats.sales_in_7_days : 0) : statsTimeRange.value === 'month' ?
                                                    (stats.sales_in_30_days ? stats.sales_in_30_days : 0) : (stats.sales_in_all_time ? stats.sales_in_all_time : 0)
                                                }
                                                <strong> units</strong>
                                            </p>
                                        </Container>
                                        <Container className="stat">
                                            <h3 className="stat-heading">Total Orders</h3>
                                            <p className="stat-value">
                                                {
                                                    statsTimeRange.value === 'today' ?
                                                    (stats.orders_today ? stats.orders_today : 0) : statsTimeRange.value === 'week' ?
                                                    (stats.orders_in_7_days ? stats.orders_in_7_days : 0) : statsTimeRange.value === 'month' ?
                                                    (stats.orders_in_30_days ? stats.orders_in_30_days : 0) : (stats.totalOrders)
                                                } 
                                                <strong> orders</strong>
                                            </p>
                                        </Container>
                                        <Container className="stat">
                                            <h3 className="stat-heading">Sales Value (in PKR)</h3>
                                            <p className="stat-value">
                                                <strong>PKR. </strong>
                                                {
                                                    statsTimeRange.value === 'today' ?
                                                    (stats.sales_value_today ? stats.sales_value_today : 0) : statsTimeRange.value === 'week' ?
                                                    (stats.value_in_7_days ? stats.value_in_7_days : 0) : statsTimeRange.value === 'month' ?
                                                    (stats.value_in_30_days ? stats.value_in_30_days : 0) : (stats.value_in_all_time ? stats.value_in_all_time : 0)
                                                }
                                            </p>
                                        </Container>
                                    </Container>
                                </Container>
                            </Container>
                        </Container>
                    )
            }
            {
                userIsAuthorized() &&
                    <Container className="stats-table-container">
                        <h3 className="heading table-container-heading top-heading">Product Sales Breakdown ({statsTimeRange.label})</h3>
                        <Container className="search-bar-container">
                            <Form.Control 
                                type="text" 
                                placeholder="Search by product name or barcode" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="mb-3 search-bar"
                            />
                            <Button variant="secondary" className="reset-btn" onClick={()=>setSearchQuery('')}>Reset</Button>
                        </Container>
                        <Table striped bordered hover className="stats-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product Name</th>
                                    <th>Unit Price (PKR)</th>
                                    <th>Units Sold</th>
                                    <th>Sales Value (PKR)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    filteredProducts?.map((product, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    {product.name}&nbsp;&nbsp;
                                                    <strong>
                                                        ({product.barcode})
                                                    </strong>
                                                </td>
                                                <td>
                                                    <strong>PKR. </strong>{product.price}
                                                </td>
                                                <td>
                                                    {
                                                        statsTimeRange.value === 'today' ?
                                                        product.sales_today : statsTimeRange.value === 'week' ?
                                                        product.sale_quantity_in_7_days : statsTimeRange.value === 'month' ?
                                                        product.sale_quantity_in_30_days : product.sale_quantity
                                                    }
                                                </td>
                                                <td>
                                                    <strong>PKR. </strong>
                                                    {
                                                        statsTimeRange.value === 'today' ?
                                                        product.sale_value_today : statsTimeRange.value === 'week' ?
                                                        product.sale_value_in_7_days : statsTimeRange.value === 'month' ?
                                                        product.sale_value_in_30_days : product.sale_value
                                                    }
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </Table>
                    </Container>
            }
        </Container>
    )
}

//I dont have any more idea about this page lol. Will complpete its design later :>