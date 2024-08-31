import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Userdata.css';
import Lottie from 'react-lottie';
import logoutAnimationData from './Components/logout.json';
import { useNavigate } from 'react-router-dom';

const Userdata = ({ authToken }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLogout, setIsLogout] = useState(false);
  const [view, setView] = useState('manage'); // 'manage', 'add', 'remove'
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
    setIsLogout(true);
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
    }, 2000);
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
      <div className='container'>
        <div className='logout-button-div'>
          <button onClick={handleLogout} className='logout-button'>
            <i className='fa-solid fa-power-off fa-2x'></i>
          </button>
        </div>
        {loading && (
          <div className='loading-logo'>
            <Lottie options={{ loop: true, autoplay: true, animationData: logoutAnimationData, rendererSettings: { preserveAspectRatio: 'xMidYMid slice' } }} height={200} width={200} />
          </div>
        )}
        <div id='notification' className='notification hidden'></div>

        {view === 'manage' && (
          <div className='usermanage'>
            <h1 className='nwr'>North Western Railways</h1>
            <h1 className='umd'>Users Management Dashboard</h1>
            <div className='usermanagebutton'>
              <button className='userbutton-1' onClick={() => handleChangeView('add')}>
                &nbsp;<i className='fa-solid fa-user-plus'></i>&nbsp; Register User
              </button>
              <button className='userbutton-2' onClick={() => handleChangeView('remove')}>
                &nbsp;<i className='fa-solid fa-user-minus'></i>&nbsp; Remove User
              </button>
            </div>
          </div>
        )}

        {view === 'add' && (
          <div className='add-user'>
            <h3 className='adduser'>Add User</h3>
            <form className='detail-form' onSubmit={handleSubmit}>
              <input type='text' name='name' placeholder='Name' value={formData.name} onChange={handleChange} />
              <input type='text' name='username' placeholder='Username' value={formData.username} onChange={handleChange} />
              <input type='email' name='email' placeholder='Email' value={formData.email} onChange={handleChange} />
              <input type='password' name='password' placeholder='Password' value={formData.password} onChange={handleChange} />
              <br />
              {error && <p>{error}</p>}
              <br />
              <button type='submit'>
                &nbsp;<i className='fa-solid fa-user-plus'></i>&nbsp; Add User
              </button>
              <button type='button' onClick={() => handleChangeView('manage')}>
                Back
              </button>
            </form>
          </div>
        )}

        {view === 'remove' && (
          <div className='removeuser'>
            <h2 className='displayuser'>
              Users List &nbsp;<i className='fa-solid fa-users'></i>
            </h2>
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
                      <button className='delete' onClick={() => deleteUser(user._id)}>
                        <i className='fa-solid fa-trash fa-2x'></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type='button'className='Back' onClick={() => handleChangeView('manage')}>
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Userdata;
