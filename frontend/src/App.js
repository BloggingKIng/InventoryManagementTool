import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Container } from 'react-bootstrap';
import Login from './Pages/Login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useUserContext } from './Context/UserContextProvider';
import { useEffect, useState } from 'react';
import Home from './Pages/Home';
import Users from './Pages/Users';
import { ToastContainer } from 'react-toastify';
import Inventory from './Pages/Invetory';
import Checkout from './Pages/Checkout';
import Receipt from './Pages/Receipt';
import Orders from './Pages/Orders';
import StockAlerts from './Pages/StockAlerts';

function App() {
  const { setUser, setLoggedIn, setToken, loggedIn, token } = useUserContext();
  const [devices, setDevices] = useState([]);
  useEffect(() => {
    const loadDevices = async () => {
        let availableDevices = await navigator.mediaDevices.enumerateDevices();
        availableDevices = availableDevices.filter(device => device.kind === 'videoinput');
        setDevices(availableDevices);
    };

    loadDevices();
}, []);
  const handleLogin = async() => {
    const token = localStorage.getItem('token');
    if(token) {
      await axios.get('http://127.0.0.1:8000/auth/users/me/', {
        headers: {
          Authorization: `Token ${token}`
        }
      })
      .then((response)=> {
          setUser(response.data);
          setLoggedIn(true);
          setToken(token);
          console.log(response.data);
          console.log(token);
      })
      .catch((error)=> {
          console.log(error);
          localStorage.removeItem('token');
          setLoggedIn(false);
          setToken(null);
      })
    }
  }

  useEffect(() => {
    handleLogin();
  }, [token, loggedIn])
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/users' element={<Users />} />
        <Route path='/inventory' element={<Inventory devices={devices} />} />
        <Route path='/checkout' element={<Checkout devices={devices} />} />
        <Route path='/receipt/:id' element={<Receipt />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/stock-alerts' element={<StockAlerts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
