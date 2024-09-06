import React, { useState } from 'react';
import axios from 'axios';
import { HiUsers } from "react-icons/hi2";
import { MdEmail } from "react-icons/md";
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (email === '') {
            setError('Enter Email Address');
            setTimeout(() => setError(''), 1500);
            return;
        }

        try {
            const response = await axios.post('https://nwr-server.vercel.app/api/forgot-password', { email });
            setMessage(response.data.message || 'Password Reset Link Sent to your Email.');
            
        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    setError('No User associated with this Email');
                    setTimeout(() => setError(''), 1500);
                } else {
                    setError(error.response.data.message || 'Something went wrong');
                    setTimeout(() => setError(''), 1500);
                }
            } else if (error.request) {
                setError('Server Error !. Try again later.');
                setTimeout(() => setError(''), 1500);
            } else {
                setError(`Error: ${error.message}`);
                setTimeout(() => setError(''), 1500);
            }
            setMessage('');
        }
        finally{
            setEmail('');
            setTimeout(()=>{
                setError('');
                setMessage('')
            },1500)
        }
    };

    return (
        <div className='container-div'>
            <h1 className='h1nwr'>North Western railways</h1>
            <div className='reset-container'>
                <form className="forgot-form" onSubmit={handleSubmit} noValidate>
                    <h2>Forgot Password</h2>
                    <p>Enter Your Email associated to your Account</p>
                    <div className='inputbox'>
                        <span className='icon'><MdEmail/></span>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                        <label htmlFor="email">Email</label>
                    </div>
                    {message && <p className='message' style={{ color: 'green' }}>{message}</p>}
                    {error && <p className="error"style={{ color: 'red' }}>{error}</p>}
                    <button className='request-reset'type="submit">Forgot Password</button>
                    <div className='back-to-login'>
                        <p>Back to Login ! &nbsp;<span className='usericon'><HiUsers /></span> &nbsp; &nbsp; &nbsp; &nbsp;<a className='back-login' href="/login">Login!</a></p>
                    </div>
                </form>
            </div>           
        </div>
    );
};

export default ForgotPassword;
