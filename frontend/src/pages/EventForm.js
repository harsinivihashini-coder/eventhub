import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['Social', 'Sports', 'Academic', 'Cultural', 'Workshop', 'Other'];

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', location: '', event_date: '',
    capacity: 50, image_url: '', category: 'Social',
  });

  useEffect(() => {
    if (isEdit) {
      api.get(`/events/${id}`).then(({ data }) => {
        setForm({
          title: data.title, description: data.description || '',
          location: data.location || '',
          event_date: new Date(data.event_date).toISOString().slice(0, 16),
          capacity: data.capacity, image_url: data.image_url || '',
          category: data.category || 'Social',
        });
      }).catch(() => toast.error('Failed to load event.'));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/events/${id}`, form);
        toast.success('Event updated!');
      } else {
        await api.post('/events', form);
        toast.success('Event created!');
      }
      navigate('/events');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save event.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="page">
      <div className="page-header">
        <h1>{isEdit ? 'Edit Event' : 'Create New Event'}</h1>
      </div>
      <div className="form-card">
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label>Event Title *</label>
            <input type="text" value={form.title} onChange={set('title')} placeholder="Annual Sports Day" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date & Time *</label>
              <input type="datetime-local" value={form.event_date} onChange={set('event_date')} required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input type="text" value={form.location} onChange={set('location')} placeholder="Main Hall, Block B" />
            </div>
            <div className="form-group">
              <label>Capacity</label>
              <input type="number" value={form.capacity} onChange={set('capacity')} min={1} max={1000} />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={set('description')} rows={4}
              placeholder="Describe the event..." />
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input type="url" value={form.image_url} onChange={set('image_url')} placeholder="https://..." />
          </div>
          {form.image_url && <img src={form.image_url} alt="preview" className="img-preview" onError={(e) => e.target.style.display = 'none'} />}
          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
