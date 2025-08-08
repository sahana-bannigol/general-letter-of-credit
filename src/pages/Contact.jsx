import React, { useState } from 'react';
import '../styles/theme.css';
export default function Contact() {
  const [formData, setFormData] = useState({name: '', email: '', company: '', message: ''});

  function handleChange(e) {
    setFormData({...formData, [e.target.name]: e.target.value});
  }

  function handleSubmit(e) {
    e.preventDefault();
    alert('Thanks for reaching out! We will get back to you shortly.');
    setFormData({name: '', email: '', company: '', message: ''});
  }

  return (
    <div className="container">
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', maxWidth: '400px'}}>
        <label>Name</label>
        <input name="name" type="text" value={formData.name} onChange={handleChange} required />
        
        <label>Email</label>
        <input name="email" type="email" value={formData.email} onChange={handleChange} required />

        <label>Company</label>
        <input name="company" type="text" value={formData.company} onChange={handleChange} />

        <label>Message</label>
        <textarea name="message" rows="4" value={formData.message} onChange={handleChange} required />

        <button type="submit" style={{marginTop: '1rem'}}>Submit</button>
      </form>
    </div>
  );
}
