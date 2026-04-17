import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Users } from 'lucide-react';

const MyRegistrations = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyEvents = async () => {
    try {
      const { data } = await api.get('/registrations/my/events');
      setEvents(data);
    } catch {
      toast.error('Failed to load your events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyEvents(); }, []);

  const handleUnregister = async (id) => {
    try {
      await api.delete(`/registrations/${id}`);
      toast.success('Unregistered successfully.');
      fetchMyEvents();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed.');
    }
  };

  const upcoming = events.filter(e => new Date(e.event_date) > new Date());
  const past = events.filter(e => new Date(e.event_date) <= new Date());

  const EventRow = ({ event }) => (
    <div className="reg-card">
      <div className="reg-date">
        <span>{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}</span>
        <strong>{new Date(event.event_date).getDate()}</strong>
      </div>
      <div className="reg-info">
        <h4>{event.title}</h4>
        <div className="reg-meta">
          {event.location && <span><MapPin size={13} /> {event.location}</span>}
          <span><Users size={13} /> {event.registered_count}/{event.capacity}</span>
          <span><Calendar size={13} /> {new Date(event.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
      <div className="reg-actions">
        <Link to={`/events/${event.id}`} className="btn btn-outline btn-sm">View</Link>
        {new Date(event.event_date) > new Date() && (
          <button onClick={() => handleUnregister(event.id)} className="btn btn-danger btn-sm">Cancel</button>
        )}
      </div>
    </div>
  );

  if (loading) return <div className="page"><div className="loading-spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Registrations</h1>
        <p>{events.length} event{events.length !== 1 ? 's' : ''} registered</p>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} />
          <p>You haven't registered for any events yet.</p>
          <Link to="/events" className="btn btn-primary">Browse Events</Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="section">
              <h2>Upcoming ({upcoming.length})</h2>
              <div className="reg-list">{upcoming.map(e => <EventRow key={e.id} event={e} />)}</div>
            </div>
          )}
          {past.length > 0 && (
            <div className="section">
              <h2>Past Events ({past.length})</h2>
              <div className="reg-list past-list">{past.map(e => <EventRow key={e.id} event={e} />)}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyRegistrations;
