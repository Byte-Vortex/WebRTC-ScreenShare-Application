import React, { useState ,useEffect} from 'react';
import axios from 'axios';
import Lottie from 'react-lottie';
import { FaUser, FaLock} from "react-icons/fa";
import { HiUsers } from "react-icons/hi2";
import animationData from './Components/login.json'; 
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css'
import { Link } from 'react-router-dom';

const AdminLogin = ({setAuthToken}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const savedUsername = localStorage.getItem('AdminUsername');
        if (savedUsername) {
            setUsername(savedUsername);
            setRememberMe(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
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
            setTimeout(() => setError(''),1500);
            return;
        } 
    
        setError('');
        setLoading(true);
        try {
            const response = await axios.post('https://nwr-server.vercel.app/admin/login', { username, password });
            const token = response.data.token;
    
            if (token) {
                setAuthToken(token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                localStorage.setItem('adminToken', token);

                if (rememberMe) {
                    localStorage.setItem('AdminUsername', username);
                } else {
                    localStorage.removeItem('AdminUsername');
                }
    
                setTimeout(() => {
                    setLoading(false);
                    navigate('/userdata');
                }, 500);
            } else {
                delete axios.defaults.headers.common['Authorization'];
                localStorage.removeItem('adminToken');
                throw new Error("No token received");
            }
        } catch (err) {
            setLoading(false);
            console.error('There was an error while logging in!', err); // Changed from error to err
            setError('Invalid Username or Password');
            setTimeout(() => {setError('');}, 2000);
        }
        finally{
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
    <div className="container-div">   
            {loading && (<div className="loading-logo"><Lottie options={defaultOptions} height={150} width={150} /></div>)}
            <img src="/NWR.png" alt="" />
            <h1 className='h1-nwr'>North Western railways</h1>
            <div className='login-container'>
                <form className="login-form" onSubmit={handleLogin} noValidate>
                
                <h2>Admin Login</h2>
                    <div className='input-box'>
                        <span className='icon'><FaUser /></span>
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
                        <span className='icon'><FaLock /></span>
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
                        <a href="">Forgot Password ?</a>
                    </div>
                        {error && <p className='error'>{error}</p>}
                    <button className='login-btn' type="submit">Login</button>
                    <div className='user-login'>
                        <p>Are you User &nbsp;<span className='user-icon'><HiUsers /></span> &nbsp; &nbsp; &nbsp; &nbsp;<a className='admin-link' href="/login">Login Here!</a></p>
                    </div>
                </form>
            </div>
        </div>
  );
};

export default AdminLogin;
