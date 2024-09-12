import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'react-lottie';
import loginAnimationData from './Components/Loading.json';
import logoutAnimationData from './Components/logout.json';
import { MdStopScreenShare } from "react-icons/md";
import api from './api';
import { IoLogOut } from "react-icons/io5";
import './Dashboard.css'

const Dashboard = () => {
    const [connectionCode, setConnectionCode] = useState('');
    const [name, setName] = useState(''); 
    const [loading, setLoading] = useState(false);
    const [isLogout, setIsLogout] = useState(false); 
    const [showDivA, setShowDivA] = useState(true);
    const [showDivB, setShowDivB] = useState(true); 
    const navigate = useNavigate();

    useEffect(() => {
        loadScript('/script.js');
        fetchConnectionCode();
    }, []);

    const fetchConnectionCode = async () => {
        try {
            const response = await api.get('https://nwr-server.vercel.app/api/getConnectionId');
            const code = response.data.connectionId;
            const name = response.data.name;
            setConnectionCode(code);
            setName(name); 
            window.connectionCode = code;
        } catch (error) {
            console.error('Error fetching Connection Code:', error);
        }
    };

    const handleLogout = () => {
        setIsLogout(true);
        setLoading(true);
        setTimeout(() => {
            setLoading(false); 
            navigate('/login');
            localStorage.removeItem('token');
        }, 1000);
    };
        
    const loadScript = (src) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.body.appendChild(script);
    };

    const loginOptions = {
        loop: true,
        autoplay: true,
        animationData: loginAnimationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    const logoutOptions = {
        loop: true,
        autoplay: true,
        animationData: logoutAnimationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    const handleHost = () => {
        window.createConnection();
        setTimeout(()=>{
            setShowDivB(false);
        },1200)
    };

    const handleRemote = () => {
        window.joinconnection()
        setTimeout(()=>{
            setShowDivA(false);
        },1200)
    };

    const handlestreamtohost = () => {
        window.stopScreenSharing();
        document.getElementById("screenshare-container").hidden = true;
        document.getElementById("stopoptions").style.display='none';
    };

    const handlesharetohost = () => {
        window.shareScreenToHost();
        setTimeout(()=>{
            document.getElementById('tohost').style.display='none';
        },1000)
    };

    const handlegethost=()=>{
        window.getHostScreen();
        setTimeout(()=>{
            document.getElementById('gethost').style.display='none';
        },1000)
    }

    const handleAcceptRequest=()=>{
        window.screenAccessRequest(true);
        document.getElementById('hostoptions').style.display='none'
    }

    const handleDeclineRequest=()=>{
        window.declineScreenAccess();
        document.getElementById('hostoptions').style.display='none'
    }

    return (
        <div className='background'>
            {loading && (
                <div className="loading-logo"><Lottie options={isLogout ? logoutOptions : loginOptions} height={200} width={200} />
                </div>
                )}     

            <div id="notification" className="notification"></div>
            <div className='dashboard-container'>
            <div className='header'>
                <h4>Welcome ,</h4>
                <h3>{name} &nbsp;!</h3>
                <button onClick={handleLogout} className='logoff-btn'><IoLogOut /></button>
                </div>
                <div className="info-div" >
                    <div className='A' style={{display:showDivA?'flex':'none'}}>
                    <div className='connection-code-div'>
                        {connectionCode && (
                            <p className='connection-code'>{connectionCode}<i id="check" style={{display:'inline',color:'red',transition:'.2s ease-in-out'}} className="fa-regular fa-circle-check"></i></p>
                        )}
                        </div>
                        <div className='button'>
                            <button className="ashost" id='ashost' onClick={handleHost}>Connect as Host</button>
                        </div>   
                    </div>
                    <div className='B' style={{display:showDivB?'flex':'none'}}>
                    <input className='connection-id-input' id="connection-input" type="text" placeholder="Enter Connection Code"  required />
                    <div className='button'>
                        <button className="asremote" onClick={handleRemote}>Connect as Remote</button>
                    </div>
                    </div>        
                    
                </div>

                <div className='screen-share-options'>
                    <div className='gethost-div' id='gethost'>
                        <button className='gethostscreen'  onClick={handlegethost}>Get Host Screen</button>
                    </div>
                    <div className='tohost-div' id='tohost' >
                        <button className='sharescreentohost' onClick={handlesharetohost}>Share my Screen</button>
                    </div>
                </div>
                <div className='hostoptions' id='hostoptions'>
                    <div>
                        <button className="acceptrequest" id='acceptrequest' onClick={handleAcceptRequest}>Accept Request for Share</button>
                    </div>
                    <div>
                        <button className="declinerequest" id='declinerequest' onClick={handleDeclineRequest}>Decline Request for Share</button>
                    </div>       
                </div>
                <div className='stopoption' id='stopoptions'>
                        <button className="stopscreen" id='stopscreen' onClick={handlestreamtohost}><MdStopScreenShare />&nbsp; Stop Sharing</button>
                </div>
                
                <div className='screencontainers' >
                    <div id="screenshare-container" className='playback-containers' hidden>
                        <h3 className='h3-display'>Shared Screen View</h3> 
                        <video  id="screenshared-video" controls className="video-container"></video>
                    </div>  
                    <div id="remote-vid-container" hidden className='playback-containers'> 
                        <h3 className='h3-display'>Remote Screen View</h3> 
                        <video id="remote-video" controls className="video-container"></video>
                    </div>                   
                </div>
                
            </div>
        </div>
    );
};

export default Dashboard;