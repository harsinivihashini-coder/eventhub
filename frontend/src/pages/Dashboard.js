import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Calendar, Users, CheckCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ icon, label, value, color }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-icon">{icon}</div>
    <div>
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    if (isAdmin) api.get('/users/stats').then(({ data }) => setStats(data)).catch(() => {});
    api.get('/events').then(({ data }) => {
      setUpcomingEvents(data.filter(e => new Date(e.event_date) > new Date()).slice(0, 3));
    }).catch(() => {});
  }, [isAdmin]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome back, {user?.name} 👋</h1>
        <p>{user?.community ? `${user.community} · ` : ''}{user?.role}</p>
      </div>

      {isAdmin && stats && (
        <div className="stats-grid">
          <StatCard icon={<Calendar size={24} />} label="Total Events" value={stats.totalEvents} color="blue" />
          <StatCard icon={<TrendingUp size={24} />} label="Upcoming Events" value={stats.upcomingEvents} color="green" />
          <StatCard icon={<Users size={24} />} label="Total Members" value={stats.totalUsers} color="purple" />
          <StatCard icon={<CheckCircle size={24} />} label="Registrations" value={stats.totalRegistrations} color="orange" />
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <h2>Upcoming Events</h2>
          <Link to="/events" className="btn btn-outline">View All</Link>
        </div>
        {upcomingEvents.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <p>No upcoming events. {isAdmin && <Link to="/events/create">Create one!</Link>}</p>
          </div>
        ) : (
          <div className="events-preview">
            {upcomingEvents.map(event => (
              <Link to={`/events/${event.id}`} key={event.id} className="preview-card">
                <div className="preview-date">
                  <span>{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <strong>{new Date(event.event_date).getDate()}</strong>
                </div>
                <div className="preview-info">
                  <h4>{event.title}</h4>
                  <p>{event.location || 'Location TBD'} · {event.registered_count}/{event.capacity} registered</p>
                </div>
                {event.is_registered && <span className="registered-tag">✓ Registered</span>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
