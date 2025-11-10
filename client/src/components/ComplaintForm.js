import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import axios from 'axios';

export default function ComplaintForm(){
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Other');
  const [priority, setPriority] = useState('Low');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [room, setRoom] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [status, setStatus] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('title', title);
    form.append('category', category);
    form.append('priority', priority);
    form.append('building', building);
    form.append('floor', floor);
    form.append('room', room);
    form.append('description', description);
    form.append('isAnonymous', isAnonymous);
    attachments.forEach(f => form.append('attachments', f));
    audioFiles.forEach(f => form.append('audioFiles', f));
    videoFiles.forEach(f => form.append('videoFiles', f));
    try{
      const res = await axios.post('/api/complaints', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStatus('Submitted: ' + res.data.data.ticketId);
      setTitle(''); setDescription('');
    }catch(err){
      console.error(err);
      alert('Error creating complaint');
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 800 }}>
      <h2>New Complaint</h2>
      <div>
        <label>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div>
        <label>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option>Academics/Instructor</option>
          <option>Facility/Infrastructure</option>
          <option>IT/Systems</option>
          <option>Admin/Support</option>
          <option>Other</option>
        </select>
      </div>
      <div>
        <label>Priority</label>
        <select value={priority} onChange={e => setPriority(e.target.value)}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>
      <div>
        <label>Location</label>
        <input placeholder="Building" value={building} onChange={e=>setBuilding(e.target.value)} />
        <input placeholder="Floor" value={floor} onChange={e=>setFloor(e.target.value)} />
        <input placeholder="Room/Lab" value={room} onChange={e=>setRoom(e.target.value)} />
      </div>
      <div>
        <label>Description</label>
        <ReactQuill value={description} onChange={setDescription} />
      </div>
      <div>
        <label>Attachments</label>
        <input type="file" multiple onChange={e => setAttachments([...e.target.files])} />
      </div>
      <div>
        <label>Audio</label>
        <input type="file" accept="audio/*" multiple onChange={e => setAudioFiles([...e.target.files])} />
      </div>
      <div>
        <label>Video</label>
        <input type="file" accept="video/*" multiple onChange={e => setVideoFiles([...e.target.files])} />
      </div>
      <div>
        <label>Submit Anonymously</label>
        <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
      </div>
      <button type="submit">Submit</button>
      <div>{status}</div>
    </form>
  );
}
