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
  // const [showAddPreferenceModal, setShowAddPreferenceModal] = useState(false); // State to show or hide modal
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState([]);
  const [availablePreferences, setAvailablePreferences] = useState([]);
  const [error, setError] = useState("");

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

  // const handlePreferenceChange = async (e) => {
  //   const value = e.target.value;
  //   const preferenceArray = value.split(",");
  //   try {
  //     if (user) {
  //       const userRef = db.collection("users").doc(user.email);
  //       const doc = await userRef.get();

  //       if (doc.exists) {
  //         await userRef.update({
  //           preferences: preferenceArray,
  //         });
  //         setMyPreferences(preferenceArray);
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  // };

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

  // const handleAddPreference = async () => {
  //   // Split the new preferences by comma, trim whitespace, and filter empty values
  //   const newPreferencesArray = newPreference
  //     .split(",")
  //     .map((p) => p.trim())
  //     .filter(Boolean);

  //   // Remove duplicates from new preferences and make sure they do not already exist in current preferences
  //   const updatedPreferences = [
  //     ...myPreferences,
  //     ...newPreferencesArray.filter((p) => !myPreferences.includes(p)),
  //   ];

  //   try {
  //     if (user) {
  //       const userRef = db.collection("users").doc(user.email);
  //       await userRef.update({
  //         preferences: updatedPreferences,
  //       });
  //       setMyPreferences(updatedPreferences);
  //       setNewPreference(""); // Clear the new preference input
  //       setShowAddPreferenceModal(false); // Close the modal
  //     }
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  // };

  // Fetch available preferences from Firestore when "+" button is clicked
  const fetchPreferences = async () => {
    try {
      // Fetch ingredients from the ingredients collection
      const ingredientsSnapshot = await db.collection("ingredients").get();
      const ingredientsList = ingredientsSnapshot.docs
        .map((doc) => doc.data().title)
        .filter((ingredient) => ingredient.split(" ").length === 1); // Only ingredients with one word

      // Fetch unique cuisines (areas) from the recipes collection
      const recipesSnapshot = await db.collection("recipes").get();
      const cuisinesSet = new Set();
      recipesSnapshot.forEach((doc) => {
        const area = doc.data().area; // Get the area (cuisine type) from the recipe
        if (area) cuisinesSet.add(area);
      });

      // Combine both lists of ingredients and cuisines
      const combinedPreferences = [
        ...ingredientsList,
        ...Array.from(cuisinesSet),
      ];

      console.log("Available Preferences:", combinedPreferences); // Log available preferences

      setAvailablePreferences(combinedPreferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      setError("Failed to load preferences. Please try again.");
    }
  };

  // Handle opening preference selection screen and fetch preferences lazily
  const handleOpenPreferences = () => {
    setShowPreferences(true);
    fetchPreferences(); // Fetch preferences only when the "+" button is clicked
  };

  // Handle saving new preferences
  const handleSavePreferences = async () => {
    const newPreferencesArray = preferences.filter(
      (p) => !myPreferences.includes(p)
    );

    // Combine existing preferences with new ones (avoid duplicates)
    const updatedPreferences = [...myPreferences, ...newPreferencesArray];

    try {
      if (user) {
        const userRef = db.collection("users").doc(user.email);
        await userRef.update({
          preferences: updatedPreferences,
        });
        setMyPreferences(updatedPreferences);
        setPreferences([]); // Clear selected preferences after saving
        setShowPreferences(false); // Close the preference selection screen
      }
    } catch (error) {
      console.error("Error saving preferences:", error.message);
      setError("Failed to save preferences. Please try again.");
    }
  };

  // Handle adding or removing preferences from the selection
  const handlePreferenceClick = (preference) => {
    setPreferences((prevPreferences) =>
      prevPreferences.includes(preference)
        ? prevPreferences.filter((pref) => pref !== preference)
        : [...prevPreferences, preference]
    );
  };

  return (
    <div style={{ backgroundColor: "#EBEBDF", height: "100vh", margin: 0 }}>
      {/* Navbar */}
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        {/* NavBar Logo */}
        <Link class="navbar-brand" to="/">
          <img class="logo" src={logo} alt="Logo" />
        </Link>

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

      <div class="header-box">
        <h1>My Info</h1>
      </div>
      <div class="card infostuff">
        <h2>Name: {user.username}</h2>
        <h2>Email: {user.email}</h2>
        <h2>Role: {user.role}</h2>
        <h2>My Preferences:</h2>
        <div style={{ display: "flex", alignItems: "center" }}>
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
            onClick={handleOpenPreferences}
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
        {/* Add code here to display saved recipes if needed */}
      </div>

      {/* Preference Selection Screen (Full Screen Overlay) */}
      {showPreferences && (
        <div className="full-screen-overlay">
          <div className="full-screen-content">
            <h2>Select Your Preferences</h2>

            <div className="preferences-section">
              <h3>Ingredients & Cuisines</h3>
              <div className="preference-buttons">
                {availablePreferences.map((pref) => (
                  <button
                    key={pref}
                    onClick={() => handlePreferenceClick(pref)}
                    className={`preference-button ${
                      preferences.includes(pref) ? "selected" : ""
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <button
                onClick={handleSavePreferences}
                className="save-preferences-btn"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowPreferences(false)}
                className="cancel-preferences-btn"
                style={{ marginLeft: "10px" }}
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