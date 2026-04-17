import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, LogOut, User, LayoutDashboard, PlusCircle, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { to: '/events', label: 'Events', icon: <Calendar size={16} /> },
    ...(isAdmin ? [{ to: '/events/create', label: 'Create Event', icon: <PlusCircle size={16} /> }] : []),
    { to: '/my-registrations', label: 'My Events', icon: <User size={16} /> },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Calendar size={22} />
        <span>EventHub</span>
      </div>

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {link.icon} {link.label}
          </Link>
        ))}
        <div className="nav-user">
          <span className={`role-badge ${isAdmin ? 'admin' : 'member'}`}>{user?.role}</span>
          <span className="user-name">{user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
