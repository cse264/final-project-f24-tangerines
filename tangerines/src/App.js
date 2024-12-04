import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LogIn from './pages/Log_In/LogIn';
import NavBar from './pages/navbar/NavBar';
import MyInfo from './pages/My_Info/MyInfo';
import Home from './pages/Home/Home';
import Search from './pages/Search/Search';
//import MyRecipes from './pages/My_Recipes/MyRecipes';


function App() {
  return(
    <Router>
      <Routes>
        <Route path="/" element={<LogIn />} />
        {/* <Route path="/myrecipes" element={<MyRecipes />} /> */}
        <Route path="/navbar" element={<NavBar />} />
        <Route path="/search" element={<Search />} />
        <Route path="/home" element={<Home />} />
        <Route path="/myinfo" element={<MyInfo />} />
      </Routes>
    </Router>
  )
}

export default App;
