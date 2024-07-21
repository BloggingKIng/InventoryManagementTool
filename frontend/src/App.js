import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Container } from 'react-bootstrap';
import Login from './Pages/Login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useUserContext } from './Context/UserContextProvider';
import { useEffect } from 'react';

function App() {
  const { setUser, setLoggedIn, setToken } = useUserContext();
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
  }, [])
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
