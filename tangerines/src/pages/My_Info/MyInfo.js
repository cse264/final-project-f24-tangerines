import React, { useEffect, useState } from "react";
import "./MyInfo.css";
import { db, auth } from "../../firebase";
import "../navbar/NavBar.css";
import { Link } from "react-router-dom";
import logo from "../../assets/images/Logo.svg";
import searchIcon from "../../assets/images/Search Icon.svg";
import MyRecipeIcon from "../../assets/images/Recipe Button.svg";
import ExploreRecipesIcon from "../../assets/images/Food Button.svg";
import ViewChefsIcon from "../../assets/images/View Chefs Button.svg";
import HomeIcon from "../../assets/images/On Hover.svg";

function MyInfo() {
  const [myPreferences, setMyPreferences] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [user, setUser] = useState({ username: "", email: "", role: "" });
  const [newPreference, setNewPreference] = useState(""); // State to manage new preference input
  const [showAddPreferenceModal, setShowAddPreferenceModal] = useState(false); // State to show or hide modal

  // Fetch the signed-in user and their information when the component mounts
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
            setUser(userData);
            setMyPreferences(userData.preferences);
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

  const handlePreferenceChange = async (e) => {
    const value = e.target.value;
    const preferenceArray = value.split(",");
    try {
      if (user) {
        const userRef = db.collection("users").doc(user.email);
        const doc = await userRef.get();

        if (doc.exists) {
          await userRef.update({
            preferences: preferenceArray,
          });
          setMyPreferences(preferenceArray);
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

  const handleAddPreference = async () => {
    // Split the new preferences by comma, trim whitespace, and filter empty values
    const newPreferencesArray = newPreference
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    // Remove duplicates from new preferences and make sure they do not already exist in current preferences
    const updatedPreferences = [
      ...myPreferences,
      ...newPreferencesArray.filter((p) => !myPreferences.includes(p)),
    ];

    try {
      if (user) {
        const userRef = db.collection("users").doc(user.email);
        await userRef.update({
          preferences: updatedPreferences,
        });
        setMyPreferences(updatedPreferences);
        setNewPreference(""); // Clear the new preference input
        setShowAddPreferenceModal(false); // Close the modal
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div style={{ backgroundColor: "#EBEBDF", height: "100vh", margin: 0 }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        {/* NavBar Logo */}
        <a className="navbar-brand" href="/">
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

      <div className="header-box">
        <h1>My Info</h1>
      </div>
      <div className="card infostuff">
        <h2>Name: {user.username}</h2>
        <h2>Email: {user.email}</h2>
        <h2>Role: {user.role}</h2>
        <h2>My Preferences:</h2>
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Display preferences as a comma-separated, nicely formatted text */}
          <div
            className="preferences-container"
            style={{
              flex: 1,
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              backgroundColor: "#fff",
            }}
          >
            {myPreferences.length > 0 ? (
              <span>{myPreferences.join(", ")}</span>
            ) : (
              <p style={{ margin: 0 }}>No Preferences Set</p>
            )}
          </div>
          <button
            onClick={() => setShowAddPreferenceModal(true)}
            style={{
              marginLeft: "10px",
              padding: "10px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            +
          </button>
        </div>
      </div>
      <div className="card">
        <h2>Saved Recipes</h2>
      </div>

      {/* Modal to add new preferences */}
      {showAddPreferenceModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add Preferences</h2>
            <input
              type="text"
              placeholder="Enter preferences separated by commas"
              value={newPreference}
              onChange={(e) => setNewPreference(e.target.value)}
            />
            <div style={{ marginTop: "20px" }}>
              <button
                onClick={handleAddPreference}
                style={{ marginRight: "10px", padding: "10px" }}
              >
                Submit
              </button>
              <button
                onClick={() => setShowAddPreferenceModal(false)}
                style={{ padding: "10px" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyInfo;
