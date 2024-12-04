import React, { useEffect } from "react";
import { useState } from "react";
import "./MyInfo.css";
import { db, auth } from "../../firebase";

// nav

import '../navbar/NavBar.css';
import { Link } from 'react-router-dom';

import logo from "../../assets/images/Logo.svg";
import searchIcon from "../../assets/images/Search Icon.svg";
import MyRecipeIcon from '../../assets/images/Recipe Button.svg';
import ExploreRecipesIcon from '../../assets/images/Food Button.svg';
import ViewChefsIcon from '../../assets/images/View Chefs Button.svg';
import HomeIcon from '../../assets/images/On Hover.svg';

function MyInfo() {
  const [myAllergies, setMyAllergies] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [user, setUser] = useState({ email: "", isChef: false });

  // Fetch the signed-in user and their information when the component mounts
  useEffect(() => {
    async function getUserInfo() {
      try {
        // Get the currently logged-in user
        const currentUser = auth.currentUser;
        if (currentUser) {
          setUser(currentUser);
          // Reference to the user's document in the "users" collection
          const userRef = db.collection("users").doc(currentUser.email);
          const doc = await userRef.get();

          if (doc.exists) {
            const userData = doc.data();
            setMyAllergies(userData.allergies || []);
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

  const handleAllergieChange = async (e) => {
    const value = e.target.value;
    const allergieArray = value.split(",");

    try {
      if (user) {
        const userRef = db.collection("users").doc(user.email); // Reference to location in database
        const doc = await userRef.get();

        if (doc.exists) {
          await userRef.update({
            allergies: allergieArray,
          });
          setMyAllergies(allergieArray); // Update state to reflect new allergies
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSavedRecipes = async (e) => {
    const value = e.target.value;
    try {
      if (user) {
        const userRef = db.collection("users").doc(user.email); // Reference to location in database
        const doc = await userRef.get();
        const userRecipes = doc.data().savedRecipes;

        if (doc.exists) {
          if (userRecipes.includes(value)) {
            userRecipes.splice(userRecipes.indexOf(value), 1);
            await userRef.update({
              savedRecipes: userRecipes,
            });
            setSavedRecipes(userRecipes); // Update state to reflect new saved recipes
          } else {
            console.log("Recipe does not exist");
          }
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };
// the return statement is just testing to see if the functions work
  return (
    <div style={{ backgroundColor: "#EBEBDF", height: "100vh", margin: 0 }}>
      {/* Navbar */}
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

      <div class="header-box">
        <h1>My Info</h1>
      </div>
      <div class="card infostuff">
        <h2>Email: {user.email}</h2>
        <h2>Role: {user.isChef ? "Chef" : "Diner"}</h2>
        <h2>My Allergies:</h2>
        <input
          type="text"
          placeholder="Enter your allergies, separated by commas"
          onChange={handleAllergieChange}
          value={myAllergies.join(",")}
        />
      </div>
      <div class="card">
          <h2>Saved Recipes</h2>
      </div>
    </div>
  );
}

export default MyInfo;