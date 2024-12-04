import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LogIn from './pages/Log_In/LogIn';
import NavBar from './pages/navbar/NavBar';
import Home from './pages/Home/Home';
import MyInfo from './pages/My_Info/MyInfo';


function App() {
  return(
    <Router>
      <Routes>
        <Route path="/" element={<LogIn />} />
      
        <Route path="/navbar" element={<NavBar />} />
        <Route path="/home" element={<Home />} />
        <Route path="/myinfo" element={<MyInfo />} />
      </Routes>
    </Router>
  )
}

export default App;
