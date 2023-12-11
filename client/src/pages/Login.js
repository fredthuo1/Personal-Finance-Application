import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate  } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errorMessage, setErrorMessage] = useState(null); 

    const { login } = useContext(AuthContext); 
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/users/login', formData);
            localStorage.setItem('token', response.data.token);

            if (login) {
                login();
            }

            navigate('/'); 

        } catch (error) {
            setErrorMessage(error.response.data.msg); 
        }
    }

    return (
        <div>
            <h2>Login</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error message if it exists */}
            <form onSubmit={handleSubmit}>
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;
