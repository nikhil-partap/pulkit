import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

const blankSession = { title: '', topic: '', level: '', time: '', duration: '', seats: '', description: '' };

function Field({ label, id, error, children }) {
  return <div className="session-form-field"><label htmlFor={id}>{label}</label>{children}{error && <small className="field-error">{error}</small>}</div>;
}

export default function SessionForm({ initialSession, submitLabel, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(blankSession);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initialSession ? { title: initialSession.title, topic: initialSession.topic, level: initialSession.level, time: initialSession.time, duration: initialSession.duration, seats: String(initialSession.seats), description: initialSession.description } : blankSession);
    setErrors({});
  }, [initialSession]);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const validate = () => {
    const next = {};
    if (form.title.trim().length < 4) next.title = 'Use at least 4 characters.';
    if (!form.topic) next.topic = 'Choose a topic.';
    if (!form.level) next.level = 'Choose a level.';
    if (form.time.trim().length < 5) next.time = 'Add a day and time, for example Saturday · 2:00 PM.';
    if (!/^\d+\s*min$/i.test(form.duration.trim())) next.duration = 'Use minutes, for example 60 min.';
    if (!Number.isInteger(Number(form.seats)) || Number(form.seats) < 1 || Number(form.seats) > 20) next.seats = 'Choose between 1 and 20 seats.';
    if (form.description.trim().length < 20) next.description = 'Describe what students will learn in at least 20 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validate()) onSubmit({ ...form, title: form.title.trim(), time: form.time.trim(), duration: form.duration.trim(), description: form.description.trim() });
  };

  return <form className="session-form" onSubmit={handleSubmit} noValidate>
    <Field label="Session title" id="sessionTitle" error={errors.title}><input id="sessionTitle" value={form.title} onChange={update('title')} placeholder="Example: React components for beginners" /></Field>
    <div className="session-form-row">
      <Field label="Topic" id="sessionTopic" error={errors.topic}><select id="sessionTopic" value={form.topic} onChange={update('topic')}><option value="">Choose topic</option><option>Development</option><option>Design</option><option>Career</option></select></Field>
      <Field label="Level" id="sessionLevel" error={errors.level}><select id="sessionLevel" value={form.level} onChange={update('level')}><option value="">Choose level</option><option>Beginner</option><option>Intermediate</option><option>All levels</option></select></Field>
    </div>
    <div className="session-form-row session-form-row-three">
      <Field label="Day and time" id="sessionTime" error={errors.time}><input id="sessionTime" value={form.time} onChange={update('time')} placeholder="Saturday · 2:00 PM" /></Field>
      <Field label="Duration" id="sessionDuration" error={errors.duration}><input id="sessionDuration" value={form.duration} onChange={update('duration')} placeholder="60 min" /></Field>
      <Field label="Seats" id="sessionSeats" error={errors.seats}><input id="sessionSeats" type="number" min="1" max="20" value={form.seats} onChange={update('seats')} placeholder="5" /></Field>
    </div>
    <Field label="What will students learn?" id="sessionDescription" error={errors.description}><textarea id="sessionDescription" value={form.description} onChange={update('description')} placeholder="Explain the hands-on outcome of this session." /></Field>
    <div className="session-form-actions"><button type="button" className="session-cancel-button" onClick={onCancel}><ArrowLeft size={16} /> Cancel</button><button type="submit" className="session-save-button" disabled={saving}>{saving ? 'Saving...' : <><Save size={16} /> {submitLabel}</>}</button></div>
  </form>;
}
