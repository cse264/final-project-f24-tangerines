import React from 'react';
//import { useState } from 'react';
import './NavBar.css';
import { Link } from 'react-router-dom';

import logo from "../../assets/images/Logo.svg";
import searchIcon from "../../assets/images/Search Icon.svg";
import MyRecipeIcon from '../../assets/images/Recipe Button.svg';
import ExploreRecipesIcon from '../../assets/images/Food Button.svg';
import ViewChefsIcon from '../../assets/images/View Chefs Button.svg';
import HomeIcon from '../../assets/images/On Hover.svg';

function NavBar() {
    return(
        <div>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
          {/* NavBar Logo */}
          <a class="navbar-brand" href="/">
            <img class="logo" src={logo} alt="Logo" />
          </a>
      
          {/* Toggle button for smaller screens */}
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
      
          {/* Navbar links */}
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav mx-auto">

              <li class="nav-item active">
                <Link class="navbar-link" to="/search">
                    <img class="search-icon" src={searchIcon} alt="Search" />
                </Link>
              </li>

              <li class="nav-item">
                <Link class="nav-link" to="/myrecipes">
                    <img class="my-recipe-icon" src={MyRecipeIcon} alt="My Recipes" />
                </Link>
              </li>

              <li class="nav-item">
                <Link class="nav-link" to="/myinfo">
                <img class="home-icon" src={HomeIcon} alt="Home" />
                </Link>
              </li>

              <li class="nav-item">
                <Link class="nav-link" to="/foodcategories">
                <img class="explore-recipe-icon" src={ExploreRecipesIcon} alt="Explore Recipes" />
                </Link>
              </li>

              <li class="nav-item">
                <Link class="nav-link" to="/viewchefs">
                <img class="view-chefs-icon" src={ViewChefsIcon} alt="View Chefs" />
                </Link>
              </li>

            </ul>
          </div>
        </nav>
      </div>
      
    );
}

export default NavBar;