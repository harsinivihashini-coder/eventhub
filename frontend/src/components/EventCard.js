import { Calendar, MapPin, Users, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventCard = ({ event, onRegister, onUnregister, isAdmin, onDelete }) => {
  const isPast = new Date(event.event_date) < new Date();
  const isFull = event.registered_count >= event.capacity;

  return (
    <div className={`event-card ${isPast ? 'past' : ''}`}>
      {event.image_url && <img src={event.image_url} alt={event.title} className="event-img" />}
      <div className="event-card-body">
        <div className="event-meta-top">
          {event.category && <span className="category-badge">{event.category}</span>}
          {isPast && <span className="past-badge">Past</span>}
          {isFull && !isPast && <span className="full-badge">Full</span>}
        </div>
        <h3 className="event-title">{event.title}</h3>
        <p className="event-desc">{event.description?.slice(0, 100)}{event.description?.length > 100 ? '...' : ''}</p>
        <div className="event-info">
          <span><Calendar size={14} /> {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          {event.location && <span><MapPin size={14} /> {event.location}</span>}
          <span><Users size={14} /> {event.registered_count}/{event.capacity}</span>
          {event.organizer && <span><Tag size={14} /> {event.organizer}</span>}
        </div>
        <div className="event-actions">
          <Link to={`/events/${event.id}`} className="btn btn-outline">View Details</Link>
          {!isPast && (
            event.is_registered
              ? <button onClick={() => onUnregister(event.id)} className="btn btn-danger">Unregister</button>
              : <button onClick={() => onRegister(event.id)} className="btn btn-primary" disabled={isFull}>{isFull ? 'Full' : 'Register'}</button>
          )}
          {isAdmin && (
            <>
              <Link to={`/events/${event.id}/edit`} className="btn btn-outline">Edit</Link>
              <button onClick={() => onDelete(event.id)} className="btn btn-danger">Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
