import React, { useState, useEffect } from "react";
import React, { useState, useEffect } from "react";
import "./LogIn.css";
import LogoImage from "../../assets/images/Logo Header.svg";
import { db, auth, provider, firebase } from "../../firebase";
import { useNavigate } from "react-router-dom";

function LogIn() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSignUpVisible, setIsSignUpVisible] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("normal");
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState([]);
  const [availablePreferences, setAvailablePreferences] = useState([]);
  const navigate = useNavigate();

  // Fetch ingredients and cuisines from the database
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        // Fetch ingredients from the ingredients collection
        const ingredientsSnapshot = await db.collection("ingredients").get();
        const ingredientsList = ingredientsSnapshot.docs
          .map(doc => doc.data().title)
          .filter(ingredient => ingredient.split(" ").length === 1); // Only ingredients with one word

        // Fetch unique cuisines (areas) from the recipes collection
        const recipesSnapshot = await db.collection("recipes").get();
        const cuisinesSet = new Set();
        recipesSnapshot.forEach(doc => {
          const area = doc.data().area; // Get the area (cuisine type) from the recipe
          if (area) cuisinesSet.add(area);
        });

        // Combine both lists of ingredients and cuisines
        const combinedPreferences = [...ingredientsList, ...Array.from(cuisinesSet)];
        
        console.log("Available Preferences:", combinedPreferences); // Log available preferences

        setAvailablePreferences(combinedPreferences);
      } catch (error) {
        console.error("Error fetching preferences:", error);
        setError("Failed to load preferences. Please try again.");
      }
    };

    fetchPreferences();
  }, []);

  const toggleForm = () => setIsSignUp(!isSignUp);

  const hideSignUp = () => {
    setIsSignUp(false);
    setIsSignUpVisible(true);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await auth.signInWithPopup(provider);
      const user = result.user;
      const userRef = db.collection("users").doc(user.email);
      const doc = await userRef.get();

      if (!doc.exists) {
        await userRef.set({
          uid: user.uid,
          email: user.email,
          username: user.displayName,
          role: "normal",
          preferences: [],
          savedRecipes: [],
          profilePicture: user.photoURL,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        setShowPreferences(true);
      } else {
        const userData = doc.data();
        if (userData.preferences.length === 0) {
          setShowPreferences(true);
        } else {
          navigate("/home");
        }
      }
    } catch (error) {
      setError("Google Sign-In failed. Please try again.");
      console.error("Google Sign-In error:", error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const userRef = db.collection("users").doc(email);
      const doc = await userRef.get();

      if (doc.exists && doc.data().preferences.length === 0) {
        setShowPreferences(true);
      } else {
        navigate("/home");
      }
    } catch (error) {
      setError("Invalid email or password. Please try again.");
      console.error("Error logging in:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await db.collection("users").doc(user.email).set({
        uid: user.uid,
        email: user.email,
        username: username,
        role: role,
        preferences: [],
        savedRecipes: [],
        profilePicture: "",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      setShowPreferences(true);
    } catch (error) {
      setError("Sign-Up failed. Please try again.");
      console.error("Error signing up:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    const user = auth.currentUser;

    if (user) {
      try {
        const userRef = db.collection("users").doc(user.email);
        await userRef.update({ preferences });
        setShowPreferences(false);
        navigate("/home");
      } catch (error) {
        console.error("Error saving preferences:", error.message);
        setError("Failed to save preferences. Please try again.");
      }
    }
  };

  const handlePreferenceClick = (preference) => {
    setPreferences((prevPreferences) =>
      prevPreferences.includes(preference)
        ? prevPreferences.filter((pref) => pref !== preference)
        : [...prevPreferences, preference]
    );
  };

  return (
    <div>
      {isSignUpVisible && !showPreferences && (
        <div className="card">
          <img src={LogoImage} className="logo" alt="Tangerines Logo" />
          <h1 className="loginHeader">Log In</h1>

          <form onSubmit={handleLogin}>
            <div>
              <input
                type="email"
                value={email}
                className="form-control"
                id="inputEmail"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                className="form-control"
                id="inputPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
              />
            </div>

            {error && <p className="error">{error}</p>}
            <p> </p>
            <button type="submit" className="btn btn-primary">
              {loading ? "Logging in..." : "Log In"}
            </button>

            <p className="or">or</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGoogleSignIn}
            >
              Google Log In
            </button>

            <p className="or">or</p>
            <p className="signUp">
              Don't have an account?{" "}
              <span className="signUpLink" onClick={toggleForm}>
                Sign Up
              </span>
            </p>
          </form>
        </div>
      )}

      {isSignUp && !showPreferences && (
        <div className="overlay">
          <div className="overlay-form">
            <h2>Create New Account</h2>
            <form onSubmit={handleSignUp}>
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  required
                  className="form-control"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter Username"
                  required
                  className="form-control"
                />
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="form-control"
                />
              </div>
              <div>
                <label>
                  Select Role:
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    className="form-control"
                  >
                    <option value="normal">Normal</option>
                    <option value="chef">Chef</option>
                  </select>
                </label>
              </div>

              {error && <p className="error">{error}</p>}
              <button type="submit" className="btn btn-primary">
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
              <p className="loginLink" onClick={hideSignUp}>
                Already have an account? Log In
              </p>
            </form>
          </div>
        </div>
      )}

{showPreferences && (
  <div className="preferences-container">
    <h2>Select Your Preferences</h2>

    {/* Ingredients Section */}
    <div className="preferences-section">
      <h3>Ingredients & Cuisines </h3>
      <div className="preference-buttons">
        {availablePreferences
          .filter((pref) => pref.split(" ").length === 1) // Filter to only ingredients (one word)
          .map((pref) => (
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

    {/* Area (Cuisine) Section */}
    <div className="preferences-section">
     
      <div className="preference-buttons">
        {availablePreferences
          .filter((pref) => pref.split(" ").length > 1) // Filter to only areas (more than one word)
          .map((pref) => (
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

    <div>
      <button onClick={handleSavePreferences} className="save-preferences-btn">
        Save Preferences
      </button>
    </div>
  </div>
)}
    </div>
  );
}

export default LogIn;
