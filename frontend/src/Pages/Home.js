import NavigationBar from "../Components/Navbar";
import DisplayUser from "../Components/DisplayUser";
import { Container } from "react-bootstrap";
import { useUserContext } from "../Context/UserContextProvider";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import './assets/home.css';
import axios from "axios";
import { toast } from "react-toastify";
export default function Home() {{
    const {loggedIn, token, user} = useUserContext();
    const [stats, setStats] = useState({});
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
                            <h2 className="heading">Statistics</h2>
                            <Container className="overall-stats">
                                <Container className="icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" class="bi bi-graph-up" viewBox="0 0 16 16">
                                        <path fill-rule="evenodd" d="M0 0h1v15h15v1H0zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07"/>
                                    </svg>
                                </Container>
                                <Container className="stats">
                                    <Container className="stat">
                                        <h3 className="stat-heading">Total Products Sold</h3>
                                        <p className="stat-value">
                                            {stats.sales_in_all_time} <strong>units</strong>
                                        </p>
                                    </Container>
                                    <Container className="stat">
                                        <h3 className="stat-heading">Total Orders</h3>
                                        <p className="stat-value">
                                            {stats.totalOrders} <strong>orders</strong>
                                        </p>
                                    </Container>
                                    <Container className="stat">
                                        <h3 className="stat-heading">Total Revenue</h3>
                                        <p className="stat-value">
                                            <strong>PKR. </strong>{stats.value_in_all_time}
                                        </p>
                                    </Container>
                                </Container>
                            </Container>
                        </Container>
                    )
            }
        </Container>
    )
}}

//I dont have any more idea about this page lol. Will complpete its design later :>