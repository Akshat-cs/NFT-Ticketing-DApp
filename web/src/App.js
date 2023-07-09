// App.js
import './App.css';
import React from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import BuyTickets from './components/BuyTickets';
import LogEvent from './components/LogEvent';
import CheckIn from './components/CheckIn';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MyTickets from './components/MyTickets';
import MyEvents from './components/MyEvents';

function App() {
  const [submissions, setSubmissions] = React.useState([]);

  const handleFormSubmit = (formData) => {
    const newSubmission = { ...formData };
    setSubmissions((prevSubmissions) => [newSubmission, ...prevSubmissions]);
  };

  return (
    <BrowserRouter>
      <Navbar />
      <div className='NFTbody'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/buytickets"
            element={<BuyTickets submissions={submissions} />}
          />
          <Route
            path="/logevent"
            element={<LogEvent onFormSubmit={handleFormSubmit} />}
          />
          <Route path="/mytickets" element={<MyTickets />} />
          <Route path="/myevents" element={<MyEvents />} />
          <Route path="/checkin" element={<CheckIn />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
