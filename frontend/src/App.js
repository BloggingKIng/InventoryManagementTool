import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useUserContext } from './Context/UserContextProvider';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import axios from 'axios';

import Login from './Pages/Login';
import Home from './Pages/Home';
import Users from './Pages/Users';
import Inventory from './Pages/Invetory';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const { setUser, setLoggedIn, setToken, loggedIn, token } = useUserContext();
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
        <Route path='/inventory' element={<Inventory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
