import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LogIn from './pages/Log_In/LogIn';
import NavBar from './pages/navbar/NavBar';
import MyInfo from './pages/My_Info/MyInfo';
import Search from './pages/Search/Search';
import FoodCategories from './pages/Food_Categories/FoodCategories';

import ExampleRecipe from './pages/ExampleRecipe/ExampleRecipe';
import Home from './pages/Home/Home';

function App() {
  return(
    <Router>
      <Routes>
        <Route path="/" element={<LogIn />} />

        <Route path="/navbar" element={<NavBar />} />
        <Route path="/home" element={<Home />} />
        <Route path="/myinfo" element={<MyInfo />} />
        <Route path="/search" element={<Search />} />
        <Route path="/foodcategories" element={<FoodCategories />} />
        <Route path="/recipe/:title" element={<ExampleRecipe />} />  </Routes>
    </Router>
  )
}

export default App;
