import React, { useState, useEffect } from "react";
import { createSearchParams, Link } from "react-router-dom";
import "./MyRecipes.css";
import "../navbar/NavBar.css";
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
            setSavedRecipes(userData.savedRecipes);
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

  // working
  const addRecipe = (name) => {
    const newRecipe = {
      id: savedRecipes.length + 1,
      name: name,
      image: PlaceholderImg,
    };
    setSavedRecipes([...savedRecipes, newRecipe]);
  };

  const removeRecipe = async (id) => {
    if (!savedRecipes.contains(id)) {
      console.log("Recipe not found");
    } else {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userRef = db.collection("users").doc(currentUser.email);
          const doc = await userRef.get();
          if (doc.exists) {
            await userRef.update({
              savedRecipes: savedRecipes.filter((recipe) => recipe.id !== id),
            });
            setSavedRecipes(savedRecipes.filter((recipe) => recipe.id !== id));
          }
        }
      } catch (error) {
        console.log("Error removing recipe");
      }
    }
  };

  return (
    <div style={{ backgroundColor: "#EBEBDF", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        {/* NavBar Logo */}
        <a class="navbar-brand" href="/">
          <img class="logo" src={logo} alt="Logo" />
        </a>

        {/* Toggle button for smaller screens */}
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
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
                <img
                  class="my-recipe-icon"
                  src={MyRecipeIcon}
                  alt="My Recipes"
                />
              </Link>
            </li>

            <li class="nav-item">
              <Link class="nav-link" to="/myinfo">
                <img class="home-icon" src={HomeIcon} alt="Home" />
              </Link>
            </li>

            <li class="nav-item">
              <Link class="nav-link" to="/foodcategories">
                <img
                  class="explore-recipe-icon"
                  src={ExploreRecipesIcon}
                  alt="Explore Recipes"
                />
              </Link>
            </li>

            <li class="nav-item">
              <Link class="nav-link" to="/viewchefs">
                <img
                  class="view-chefs-icon"
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

      {/* Hidden - should appear if person has no saves */}
      <div className="card">
        <h2>Save a recipe to add it here!</h2>
      </div>

      {/* Recipe images */}
      <div className="recipe-container d-flex justify-content-center flex-wrap gap-4">
        {savedRecipes.map((recipe) => (
          <div key={recipe.id} className="recipe-generic text-center">
            <img
              src={recipe.image}
              className="rounded recipe-img"
              alt={recipe.title}
            />
            <p className="mt-2">{recipe.title}</p>
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
