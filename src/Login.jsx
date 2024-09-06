import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Lottie from 'react-lottie';
import { FaUser, FaLock ,FaUserShield} from "react-icons/fa";
import animationData from './Components/login.json'; 
import './Login.css';
import { Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        const savedUsername = localStorage.getItem('UserUsername');
        if (savedUsername) {
            setUsername(savedUsername);
            setRememberMe(true);
        }
    }, []);
    
    useEffect(() => {
        const checkTokenExpiration = async () => {
            try {
                const jwt_decode = (await import('jwt-decode')).default;
                const token = localStorage.getItem('token');
                if (token) {
                    const decodedToken = jwt_decode(token);
                    const currentTime = Date.now() / 1000;
                    if (decodedToken.exp < currentTime) {
                        localStorage.removeItem('token');
                        console.log('Token has expired and has been removed from local storage.');
                        navigate('/login');
                    }
                }
            } catch (error) {
                console.error('Error while decoding token:', error);
            }
        };
    
        checkTokenExpiration();
        const interval = setInterval(checkTokenExpiration, 60000); 
    
        return () => clearInterval(interval);
    }, []);
    const handleSubmit = async (event) => {
        event.preventDefault();
    
        if (username === '' && password === '') {
            setError('Both Username and Password are required');
            setTimeout(() => setError(''), 1500);
            return;
        } else if (username === '') {
            setError('Username is required');
            setTimeout(() => setError(''), 1500);
            return;
        } else if (password === '') {
            setError('Password is required');
            setTimeout(() => setError(''), 1500);
            return;
        } 
    
        setError('');
        setLoading(true);
    
        try {
            const response = await axios.post('https://nwr-server.vercel.app/api/users/login', { username, password });
    
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
    
                if (rememberMe) {
                    localStorage.setItem('UserUsername', username);
                } else {
                    localStorage.removeItem('UserUsername');
                }
    
                setTimeout(() => {
                    setLoading(false);
                    navigate('/dashboard');
                }, 100);
            }
        } catch (error) {
            setLoading(false);
            if (error.response) {
                // Handle specific error messages from the backend
                const errorMessage = error.response.data.error;
    
                if (errorMessage === 'Invalid Username') {
                    console.error('Invalid Username:', errorMessage);
                    setError('Invalid Username');
                } else if (errorMessage === 'Invalid Password') {
                    console.error('Invalid Password:', errorMessage);
                    setError('Invalid Password');
                } else if (error.response.status === 500) {
                    console.error('Server Error:', errorMessage);
                    setError('Server Error, Please try again later');
                } else {
                    console.error('Unexpected Error:', errorMessage);
                    setError('An unexpected Error Occurred');
                }
            } else {
                console.error('Network Error or No Response from Server:', error.message);
                setError('Network error, Check your Connection');
            }
            setTimeout(() => setError(''), 2000);
        } finally {
            setUsername('');
            setPassword('');
        }
    };
    
    
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    return (
        <div className="Container">   
            {loading && (<div className="loading-logo"><Lottie options={defaultOptions} height={150} width={150} /></div>)}
            <img src="/NWR.png" alt="" />
            <h1 className='h1-nwr'>North Western railways</h1>
            <div className='Login-Container'>
                <form className="Login-Form" onSubmit={handleSubmit} noValidate>
                
                <h2>User Login</h2>
                    <div className='input-box'>
                        <span className='icon'><FaUser/></span>
                        <input
                            type="text"
                            value={username}
                            required
                            id='username'
                            onChange={(e) => setUsername(e.target.value)}
                        /> 
                        <label htmlFor="username">Username</label>
                    </div>
                    <div className='input-box'>
                        <span className='icon'><FaLock/></span>
                        <input
                            type="password"
                            required
                            value={password}
                            id='password'
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <label htmlFor="password">Password</label> 
                    </div>
                    <div className='remember-forgot'>
                        <label htmlFor="remember"><input type="checkbox" checked={rememberMe} onChange={(e)=>setRememberMe(e.target.checked)} id='remember'/>Remember me</label>
                        <a href="/forgot-password">Forgot Password ?</a>
                    </div>
                        {error && <p className='error'>{error}</p>}
                    <button className='login-btn' type="submit">Login</button>
                    <div className='admin-login'>
                        <p>Are you Admin &nbsp;<span className='admin-icon'><FaUserShield /> </span> &nbsp; &nbsp; &nbsp; &nbsp;<Link className='admin-link' to="/admin">Login Here!</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;

                                         