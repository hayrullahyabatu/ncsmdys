import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/students', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    }).then(res => res.json()).then(setStudents);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Öğrenciler</h1>
      <ul>
        {students.map(s => (
          <li key={s._id}>{s.name} {s.surname}</li>
        ))}
      </ul>
    </div>
  );
}
export default Dashboard;
