import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Userdata.css';
import Lottie from 'react-lottie';
import {FaLock,FaUserEdit,FaUserPlus,FaUsersCog } from "react-icons/fa";
import logoutAnimationData from './Components/logout.json';
import { useNavigate } from 'react-router-dom';
import { MdEmail } from "react-icons/md";
import { IoChevronBackCircle } from "react-icons/io5";
import { BiSolidUserDetail } from "react-icons/bi";
import { IoLogOut } from "react-icons/io5";
import { TiUserAdd,TiUserDelete } from "react-icons/ti";
import { MdDelete } from "react-icons/md";

const Userdata = ({ authToken }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [view, setView] = useState('manage');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://nwr-server.vercel.app/getUsers', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/admin');
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('adminToken');
    }, 1000);
  };

  const notify = (msg) => {
    const notification = document.getElementById('notification');
    notification.innerHTML = msg;
    notification.classList.remove('hidden');
    notification.classList.add('visible');
    setTimeout(() => {
      notification.classList.remove('visible');
      notification.classList.add('hidden');
    }, 1200);
  };

  const handleChangeView = (newView) => {
    setView(newView);
    setFormData({ name: '', username: '', email: '', password: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateForm = () => {
    const { name, username, email, password } = formData;
    if (!name || !username || !email || !password) {
      setError('All fields are required');
      setTimeout(() => setError(''), 1500);
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.post('https://nwr-server.vercel.app/addUser', formData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      notify('User Added Successfully!');
      setTimeout(() => 
        setFormData({ name: '', username: '', email: '', password: '' })
        , 1300);
      fetchUsers();
    } catch (error) {
      setError('Use Another Username / Email for User');
      setTimeout(() => 
        setFormData({ name: '', username: '', email: '', password: '' })
        , 1300);
      setTimeout(() => setError(''), 2000);
      fetchUsers();
      console.error('Error adding user:', error);
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`https://nwr-server.vercel.app/deleteUser/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      notify('User Deleted Successfully!');
      fetchUsers();
    } catch (error) {
      notify('Error deleting user');
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className='backgroundcontainer'>
      <div className='logoutbutton-div'>
        <h3>North Western Railways</h3>
          <button onClick={handleLogout} className='logout-button'><IoLogOut /></button>
        </div>
        {loading && (
          <div className='loading-logo'>
            <Lottie options={{ loop: true, autoplay: true, animationData: logoutAnimationData, rendererSettings: { preserveAspectRatio: 'xMidYMid slice' } }} height={200} width={200} />
          </div>
        )}
        <div id='notification' className='notification hidden'></div>


      <div className='container'>

        {view === 'manage' && (
          <div className='home-menu'>
            <h1 className='h1-first'>North Western Railways</h1>
            <h1 className='h1-second'>Users Management Dashboard</h1>
            <div className='user-manage-btn'>
              <button className='user-btn-add' onClick={() => handleChangeView('add')}> <span className='add-remove-icon'><TiUserAdd /></span> Register User</button>
              <button className='user-btn-remove' onClick={() => handleChangeView('remove')}><span className='add-remove-icon'><TiUserDelete /></span> Remove User </button>
            </div>
          </div>
        )}


        {view === 'add' && (
          <div className='add-user-container'>
            <form className='detail-form' noValidate onSubmit={handleSubmit} >
              <h2 className='adduser'>Add User</h2>
                <div className='input-box-div'>
                  <span className='icon-box'><BiSolidUserDetail /></span>
                  <input required type='text' id='name' name='name' value={formData.name} onChange={handleChange} />
                  <label htmlFor="name">Full Name</label>
                </div>
                <div className='input-box-div'>
                  <span className='icon-box'><FaUserEdit /></span>
                  <input required type='text' id='username' name='username' value={formData.username} onChange={handleChange} />
                  <label htmlFor="username">Username</label>
                </div>
                <div className='input-box-div'>
                  <span className='icon-box'><MdEmail /></span>
                  <input required type='text' id='email' name='email' value={formData.email} onChange={handleChange} />
                  <label htmlFor="email">Email</label>
                </div>
                <div className='input-box-div'>
                  <span className='icon-box'><FaLock /></span>
                  <input required type='password' name='password'  value={formData.password} onChange={handleChange} />
                  <label htmlFor="password">Password</label>
                </div>
                {error && <p className='error'>{error}</p>}
                <div className='btns'>
                  <button className='add-user-btn' type='submit'>Add User &nbsp; <span><FaUserPlus /></span></button>
                  <button className='back-btn' type='button' onClick={() => handleChangeView('manage')}>Back<span><IoChevronBackCircle /></span></button>
                </div>
            </form>
          </div>
        )}

        {view === 'remove' && (
          <div className='removeuser-container'>
            <h2 className='h2-users'>Users List <span className='user-icon'><FaUsersCog /></span></h2>
            <div className='table-container'>
              <table>
                <thead>
                  <tr>
                    <th className='name'>Name</th>
                    <th className='username'>Username</th>
                    <th className='emailid'>Email</th>
                    <th>Connection ID</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className='name'>{user.name}</td>
                      <td className='userid'>{user.username}</td>
                      <td className='email'>{user.email}</td>
                      <td className='connectioncode'>{user.connectionId}</td>
                      <td className='delbutton'>
                        <button className='delete' onClick={() => deleteUser(user._id)}> <span className='del-icon'><MdDelete /></span></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type='button'className='back-button' onClick={() => handleChangeView('manage')}>Back<span><IoChevronBackCircle /></span></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Userdata;
