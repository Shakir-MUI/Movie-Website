import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase/firebase";

import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Favorites from "./pages/Favorites";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false); // track if auth check completed

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true); // now we know auth state
    });
    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    // show loader until we confirm auth status
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {user && <Header user={user} onSignOut={() => signOut(auth)} />}
      <Routes>
        <Route
          path="/"
          element={user ? <Home /> : <Navigate to="/signin" />}
        />
        <Route
          path="/movie/:id"
          element={user ? <MovieDetails /> : <Navigate to="/signin" />}
        />
        <Route
          path="/favorites"
          element={user ? <Favorites /> : <Navigate to="/signin" />}
        />
        <Route
          path="/signin"
          element={!user ? <SignIn /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!user ? <SignUp /> : <Navigate to="/" />}
        />
      </Routes>
      {user && <Footer />}
    </Router>
  );
}

export default App;













// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";
// import MovieDetails from "./pages/MovieDetails";
// import Favorites from "./pages/Favorites";
// import SignIn from "./pages/SignIn";
// import SignUp from "./pages/SignUp";
// import Header from "./components/Header";
// import Footer from "./components/Footer";
// // import { auth, database } from "../firebase/firebase";


// function App() {
//   return (
//     <Router>
//       <Header />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/movie/:id" element={<MovieDetails />} />
//         <Route path="/favorites" element={<Favorites />} />
//         <Route path="/signin" element={<SignIn />} />
//         <Route path="/signup" element={<SignUp />} />
//       </Routes>
//       <Footer />
//     </Router>
//   );
// }

// export default App;
