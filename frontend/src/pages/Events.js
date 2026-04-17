import { useEffect, useState } from 'react';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Search, Filter } from 'lucide-react';

const CATEGORIES = ['All', 'Social', 'Sports', 'Academic', 'Cultural', 'Workshop', 'Other'];

const Events = () => {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events');
      setEvents(data);
      setFiltered(data);
    } catch {
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  useEffect(() => {
    let result = events;
    if (category !== 'All') result = result.filter(e => e.category === category);
    if (search) result = result.filter(e =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, category, events]);

  const handleRegister = async (id) => {
    try {
      await api.post(`/registrations/${id}`);
      toast.success('Registered successfully!');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.');
    }
  };

  const handleUnregister = async (id) => {
    try {
      await api.delete(`/registrations/${id}`);
      toast.success('Unregistered successfully.');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to unregister.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted.');
      fetchEvents();
    } catch {
      toast.error('Failed to delete event.');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Events</h1>
        <p>{filtered.length} event{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      <div className="filters">
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="category-filters">
          <Filter size={16} />
          {CATEGORIES.map(cat => (
            <button key={cat} className={`filter-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}>{cat}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-grid">
          {[1, 2, 3].map(i => <div key={i} className="skeleton-card" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><p>No events found.</p></div>
      ) : (
        <div className="events-grid">
          {filtered.map(event => (
            <EventCard key={event.id} event={event} isAdmin={isAdmin}
              onRegister={handleRegister} onUnregister={handleUnregister} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
