import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'react-lottie';
import logoutAnimationData from './Components/logout.json';
import "./DropdownMenu.css"; // Import the CSS file

const DropdownMenu = () => {
    const [name, setName] = useState('User'); // Replace 'User' with the actual user name
    const [isLogout, setIsLogout] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        setIsLogout(true);
        setLoading(true);
        setTimeout(() => {
            setLoading(false); 
            navigate('/login');
            localStorage.removeItem('token');
        }, 1000);
    };

    const logoutOptions = {
        loop: true,
        autoplay: true,
        animationData: logoutAnimationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    return (
        <div className="dropdown">
            <button className="dropbtn"><i className="fa-solid fa-user fa-2x"></i></button>
            <div className="dropdown-content">
                <p className="dropdown-name">{name}</p>
                <button onClick={handleLogout} className='logoutbutton'><i className="fa-solid fa-power-off fa-1x"></i></button>
            </div>
        </div>
    );
};

export default DropdownMenu;
