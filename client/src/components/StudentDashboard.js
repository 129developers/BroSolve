import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function StudentDashboard(){
  const [tickets, setTickets] = useState([]);
  useEffect(()=>{
    axios.get('/api/complaints').then(res => setTickets(res.data.data)).catch(()=>{});
  },[]);
  return (
    <div>
      <h2>Your Tickets</h2>
      <ul>
        {tickets.map(t => (
          <li key={t._id}>{t.ticketId} - {t.title} - {t.status}</li>
        ))}
      </ul>
    </div>
  );
}
