import React, { useState, useEffect } from "react";
import "./MyRecipes.css";
import "../navbar/NavBar.css";
import { Link } from "react-router-dom";
import { db, auth } from "../../firebase";

import logo from "../../assets/images/Logo.svg";
import searchIcon from "../../assets/images/Search Icon.svg";
import MyRecipeIcon from "../../assets/images/Recipe Button.svg";
import ExploreRecipesIcon from "../../assets/images/Food Button.svg";
import ViewChefsIcon from "../../assets/images/View Chefs Button.svg";
import HomeIcon from "../../assets/images/On Hover.svg";
import PlaceholderImg from "../../assets/images/placeholder-200x200.png";

function MyRecipes() {
  const [savedRecipes, setSavedRecipes] = useState([]);

  useEffect(() => {
    async function getUserInfo() {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userRef = db.collection("users").doc(currentUser.email);
          const doc = await userRef.get();

          if (doc.exists) {
            const userData = doc.data();
            console.log("User data:", userData);
            setSavedRecipes(userData.savedRecipes || []);
          }
        } else {
          console.log("No user is signed in");
        }
      } catch (error) {
        console.log(error.message);
      }
    }

    getUserInfo();
  }, []);

  const addRecipe = (name) => {
    const newRecipe = {
      id: savedRecipes.length + 1,
      name: name,
      image: PlaceholderImg,
    };
    setSavedRecipes([...savedRecipes, newRecipe]);
  };

  const removeRecipe = async (id) => {
    if (!savedRecipes.find((recipe) => recipe.id === id)) {
      console.log("Recipe not found");
    } else {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userRef = db.collection("users").doc(currentUser.email);
          const doc = await userRef.get();
          if (doc.exists) {
            const updatedRecipes = savedRecipes.filter((recipe) => recipe.id !== id);
            await userRef.update({
              savedRecipes: updatedRecipes,
            });
            setSavedRecipes(updatedRecipes);
          }
        }
      } catch (error) {
        console.log("Error removing recipe:", error);
      }
    }
  };

  return (
    <div style={{ backgroundColor: "#EBEBDF", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        {/* NavBar Logo */}
        <Link className="navbar-brand" to="/">
          <img className="logo" src={logo} alt="Logo" />
        </Link>

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

            <li className="nav-item">
              <Link className="nav-link" to="/myrecipes">
                <img
                  className="my-recipe-icon"
                  src={MyRecipeIcon}
                  alt="My Recipes"
                />
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/myinfo">
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
              <Link className="nav-link" to="/viewchefs">
                <img
                  className="view-chefs-icon"
                  src={ViewChefsIcon}
                  alt="View Chefs"
                />
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* My Recipe Stuff */}
      <div className="header-box">
        <h1>My Saved Recipes</h1>
      </div>

      {/* Show this message if there are no saved recipes */}
      {savedRecipes.length === 0 && (
        <div className="card">
          <h2>Save a recipe to add it here!</h2>
        </div>
      )}

      {/* Recipe images */}
      <div className="recipe-container d-flex justify-content-center flex-wrap gap-4">
        {savedRecipes.map((recipe) => (
          <div key={recipe.id} className="recipe-generic text-center">
            <img
              src={recipe.image || PlaceholderImg}
              className="rounded recipe-img"
              alt={recipe.name}
            />
            <p className="mt-2">{recipe.name}</p>
            <button className="btn" onClick={() => removeRecipe(recipe.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyRecipes;
