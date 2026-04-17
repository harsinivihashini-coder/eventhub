import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Users, Tag, ArrowLeft, Edit } from 'lucide-react';

const EventDetail = () => {
  const { id } = useParams();
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEvent = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data);
    } catch {
      toast.error('Event not found.');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchEvent(); }, [id]);

  const handleRegister = async () => {
    try {
      await api.post(`/registrations/${id}`);
      toast.success('Registered successfully!');
      fetchEvent();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.');
    }
  };

  const handleUnregister = async () => {
    try {
      await api.delete(`/registrations/${id}`);
      toast.success('Unregistered.');
      fetchEvent();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed.');
    }
  };

  if (loading) return <div className="page"><div className="loading-spinner" /></div>;
  if (!event) return null;

  const isPast = new Date(event.event_date) < new Date();
  const isFull = event.registered_count >= event.capacity;
  const fillPercent = Math.round((event.registered_count / event.capacity) * 100);

  return (
    <div className="page">
      <div className="detail-back">
        <button onClick={() => navigate(-1)} className="btn btn-ghost"><ArrowLeft size={16} /> Back</button>
        {isAdmin && <Link to={`/events/${id}/edit`} className="btn btn-outline"><Edit size={16} /> Edit Event</Link>}
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          {event.image_url && <img src={event.image_url} alt={event.title} className="detail-img" />}
          <div className="detail-content">
            <div className="detail-badges">
              {event.category && <span className="category-badge">{event.category}</span>}
              {isPast && <span className="past-badge">Past Event</span>}
              {isFull && !isPast && <span className="full-badge">Full</span>}
            </div>
            <h1>{event.title}</h1>
            <div className="detail-meta">
              <span><Calendar size={16} /> {new Date(event.event_date).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              {event.location && <span><MapPin size={16} /> {event.location}</span>}
              <span><Users size={16} /> {event.registered_count} / {event.capacity} registered</span>
              {event.organizer && <span><Tag size={16} /> Organized by {event.organizer}</span>}
            </div>
            <div className="capacity-bar">
              <div className="capacity-fill" style={{ width: `${fillPercent}%`, background: fillPercent >= 90 ? '#ef4444' : fillPercent >= 70 ? '#f59e0b' : '#10b981' }} />
            </div>
            <p className="capacity-text">{fillPercent}% capacity filled</p>
            {event.description && <p className="detail-description">{event.description}</p>}
            {!isPast && (
              <div className="detail-actions">
                {event.is_registered
                  ? <button onClick={handleUnregister} className="btn btn-danger btn-lg">Cancel Registration</button>
                  : <button onClick={handleRegister} className="btn btn-primary btn-lg" disabled={isFull}>{isFull ? 'Event Full' : 'Register Now'}</button>
                }
              </div>
            )}
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="attendees-card">
            <h3>Attendees ({event.attendees?.length || 0})</h3>
            {event.attendees?.length === 0 ? (
              <p className="no-attendees">No registrations yet.</p>
            ) : (
              <ul className="attendees-list">
                {event.attendees?.map(a => (
                  <li key={a.id} className="attendee-item">
                    <div className="attendee-avatar">{a.name[0].toUpperCase()}</div>
                    <div>
                      <p className="attendee-name">{a.name} {a.id === user?.id && <span className="you-tag">You</span>}</p>
                      {a.community && <p className="attendee-community">{a.community}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
