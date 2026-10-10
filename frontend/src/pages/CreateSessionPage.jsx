import React, { useState } from 'react';
import { CircleCheckBig, PlusCircle } from 'lucide-react';
import SessionForm from '../components/SessionForm';
import { useDispatch } from 'react-redux';
import { createSkillSession } from '../store/sessionsSlice';

export default function CreateSessionPage({ user, onNavigate }) {
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const createSession = async (form) => {
    setSaving(true); setMessage('');
    try {
      await dispatch(createSkillSession({ ...form, studentId: user.id, teacher: user.name })).unwrap();
      setMessage('Your session is live in Skill Exchange.');
      setTimeout(() => onNavigate('my-sessions'), 650);
    } catch (error) { setMessage(error.message || 'Could not create the session.'); }
    finally { setSaving(false); }
  };

  return <main className="student-workspace-content session-page"><section className="session-page-header"><div><p className="small-heading">TEACH WHAT YOU KNOW</p><h1>Create a skill session</h1><p>Share a focused, practical lesson with other Kairos students.</p></div><PlusCircle size={40} /></section><section className="session-form-panel"><h2>Session details</h2><p className="form-intro">Fields marked through validation help students know exactly what to expect.</p><SessionForm submitLabel="Publish session" onSubmit={createSession} onCancel={() => onNavigate('skills')} saving={saving} />{message && <p className="session-form-message"><CircleCheckBig size={16} /> {message}</p>}</section></main>;
}
