import React from 'react';
import ComplaintForm from './components/ComplaintForm';
import StudentDashboard from './components/StudentDashboard';

export default function App(){
  return (
    <div style={{ padding: 20 }}>
      <h1>BroSolve - Student Complaint Management (SCMS)</h1>
      <ComplaintForm />
      <hr />
      <StudentDashboard />
    </div>
  );
}
