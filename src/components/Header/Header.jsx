import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaPlus, FaComment, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import axios from 'axios';
import './Header.scss';

const Header = ({ toggleSidebar }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      const handleNewDirectMessage = () => {
        fetchUnreadCount();
      };

      const handleNewGroupMessage = () => {
        fetchUnreadCount();
      };

      socket.on('newDirectMessage', handleNewDirectMessage);
      socket.on('newGroupMessage', handleNewGroupMessage);

      return () => {
        socket.off('newDirectMessage', handleNewDirectMessage);
        socket.off('newGroupMessage', handleNewGroupMessage);
      };
    }
  }, [socket]);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/messages/unread-count');
      setUnreadCount(response.data.total);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header__left">
        <button className="header__menu-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <Link to="/" className="header__logo">
          <span className="header__logo-text">Sports Social</span>
        </Link>
      </div>

      <div className="header__right">
        <Link to="/create-post" className="header__create-btn">
          <FaPlus />
          <span>Create Post</span>
        </Link>

        <NotificationDropdown />

        <Link to="/messages" className="header__icon-btn">
          <FaComment />
          {unreadCount > 0 && (
            <span className="header__badge">{unreadCount}</span>
          )}
        </Link>

        <div className="header__profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
          <div className="header__avatar">
            <FaUser />
          </div>
          <span className="header__username">{user?.username}</span>
          
          {showProfileMenu && (
            <div className="header__profile-menu">
              <Link to={`/profile/${user?.id}`} className="header__profile-item">
                <FaUser />
                My Profile
              </Link>
              <button onClick={handleLogout} className="header__profile-item">
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;