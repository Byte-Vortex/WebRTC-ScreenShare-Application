import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://nwr-server.vercel.app/api/forgot-password', { email });
            setMessage('Password reset link sent to your email.');
            setError('');
        } catch (error) {
            setError('Failed to send password reset email.');
            setMessage('');
        }
    };

    return (
        <div>
            <h2>Request Password Reset</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Email:
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </label>
                <button type="submit">Request Reset</button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default ForgotPassword;
