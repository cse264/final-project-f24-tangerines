import React from "react";
import "./NavBar.css";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";

import logo from "../../assets/images/Logo.svg";
import searchIcon from "../../assets/images/Search Icon.svg";
import MyRecipeIcon from "../../assets/images/Recipe Button.svg";
import ExploreRecipesIcon from "../../assets/images/Food Button.svg";
import ViewChefsIcon from "../../assets/images/View Chefs Button.svg";
import HomeIcon from "../../assets/images/On Hover.svg";

function NavBar() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        {/* NavBar Logo */}
        <a className="navbar-brand" href="/home">
          <img className="logo" src={logo} alt="Logo" />
        </a>

        {/* Toggle button for smaller screens */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item active">
              <Link className="navbar-link" to="/search">
                <img className="search-icon" src={searchIcon} alt="Search" />
              </Link>
            </li>

            {/* <li className="nav-item">
              <Link className="nav-link" to="/myrecipes">
                <img
                  className="my-recipe-icon"
                  src={MyRecipeIcon}
                  alt="My Recipes"
                />
              </Link>
            </li> */}

            <li className="nav-item">
              <Link className="nav-link" to="/home">
                <img className="home-icon" src={HomeIcon} alt="Home" />
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/foodcategories">
                <img
                  className="explore-recipe-icon"
                  src={ExploreRecipesIcon}
                  alt="Explore Recipes"
                />
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/myinfo">
                <img
                  className="view-chefs-icon"
                  src={ViewChefsIcon}
                  alt="View Chefs"
                />
              </Link>
            </li>
          </ul>

          <button
            onClick={handleSignOut}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "none",
              border: "1px solid black",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>
    </div>
  );
}

export default NavBar;
