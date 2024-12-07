import React, { useState, useEffect } from "react";
import "./MyRecipes.css";
import "../navbar/NavBar.css";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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
            await fetchSavedRecipes(userData.savedRecipes);
            console.log("Saved recipes:", savedRecipes);
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

  // Function to fetch saved recipes
  const fetchSavedRecipes = async (recipeIDs) => {
    console.log("Fetching saved recipes...", recipeIDs);
    try {
      const recipePromises = recipeIDs.map((recipeID) =>
        db.collection("recipes").doc(recipeID).get()
      );

      const recipeDocs = await Promise.all(recipePromises);


      const uniqueRecipes = [];
      const recipeIdsSet = new Set(); // To keep track of unique recipe IDs

      recipeDocs.forEach((doc) => {
        if (doc.exists) {
          const recipeData = doc.data();
          console.log("Recipe data:", recipeData);
            uniqueRecipes.push({ id: recipeData.id, ...recipeData });
        }
      });

      setSavedRecipes(uniqueRecipes);
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
    }
  };

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

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div style={{ backgroundColor: "#EBEBDF", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        {/* NavBar Logo */}
        <Link className="navbar-brand" to="/home">
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
              src={recipe.imageURL || PlaceholderImg}
              className="rounded recipe-img"
              alt={recipe.title}
              onClick={() => navigate(`/recipe/${recipe.title}`)}
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
