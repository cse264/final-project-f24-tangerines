import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LogIn from './pages/Log_In/LogIn';
import NavBar from './pages/navbar/NavBar';
import FoodCategories from './pages/Food_Categories/FoodCategories';
import ViewChefs from './pages/View_Chefs/ViewChefs';
import Search from './pages/Search/Search';
import MyRecipes from './pages/My_Recipes/MyRecipes';
import MyInfo from './pages/My_Info/MyInfo';
import Home from './pages/Home/Home';



function App() {

  function WithNavbar() {
    return (
      <>
        <NavBar />
      </>
    );
  }

  return(
    <Router>
      <Routes>
        <Route path="/" element={<LogIn />} />
        <Route path="/navbar" element={<NavBar />} />
        <Route path="/foodcategories" element={<WithNavbar><FoodCategories /></WithNavbar>} />
        <Route path="/viewchefs" element={<WithNavbar><ViewChefs /></WithNavbar>} />
        <Route path="/search" element={<WithNavbar><Search /></WithNavbar>} />
        <Route path="/myrecipes" element={<WithNavbar><MyRecipes /></WithNavbar>} />
        <Route path="/myinfo" element={<WithNavbar><MyInfo /></WithNavbar>} />
        <Route path="/home" element={<WithNavbar><Home /></WithNavbar>} />
      </Routes>
    </Router>
  )
}

export default App;
