import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {FaLock} from "react-icons/fa";
import { HiUsers } from "react-icons/hi2";
import './ResetPassword.css'

const ResetPassword = () => {
    const { userid, token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    
    useEffect(() => {
        // Validate token when the component mounts
        const validateToken = async () => {
            try {
                const response = await axios.post('https://nwr-server.vercel.app/api/validate-token', { token });
                if (response.data.status !== 'success') {
                    setError('Invalid or expired token.');
                    navigate('/login');
                    
                }
            } catch (error) {
                setError('Error validating token.');
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setMessage('');
            return;
        }
    
        try {
            const response = await axios.post('https://nwr-server.vercel.app/api/reset-password', { token, newPassword });
            setMessage('Password has been reset successfully.');
            setError('');
        } catch (error) {
            console.error('Error during password reset:', error); // Log the full error for debugging
    
            if (error.response) {
                if (error.response.status === 400) {
                    setError(`Error: ${error.response.data || 'Invalid request'}`);
                } else {
                    setError(`Server error: ${error.response.data || 'Something went wrong'}`);
                }
            } else if (error.request) {
                setError('No response from the server. Please try again later.');
            } else {
                setError(`Error: ${error.message}`);
            }
    
            setMessage('');
        }
        finally{
            setNewPassword('');
            setConfirmPassword('');
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
                <form className='reset-form'onSubmit={handleSubmit} noValidate>
                    <h2>Reset Password</h2>
                    <div className='input_box'>
                        <span className='icon'><FaLock/></span>
                        <input 
                                type="password" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                required 
                            />
                        <label>New Password</label>
                    </div>
                    <div className='input_box'>
                        <span className='icon'><FaLock/></span>
                        <input 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                        />
                        <label>Confirm Password</label>

                    </div>
                    {message && <p className='message' style={{ color: 'green' }}>{message}</p>}
                    {error && <p className='error' style={{ color: 'red' }}>{error}</p>}
                    <button className='reset' type="submit">Change Password</button>
                    <div className='back-to-login'>
                        <p>Back to Login ! &nbsp;<span className='usericon'><HiUsers /></span> &nbsp; &nbsp; &nbsp; &nbsp;<a className='back-login' href="/login">Login!</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
