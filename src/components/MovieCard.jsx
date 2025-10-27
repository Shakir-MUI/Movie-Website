import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { database, auth } from "../firebase/firebase";
import { ref, set, remove, onValue } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";

export default function MovieCard({ movie, showRemoveOption = false, onRemove }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setIsFavorite(false);
      return;
    }

    const favRef = ref(database, `favorites/${currentUser.uid}/${movie.imdbID}`);
    const unsubscribe = onValue(favRef, (snapshot) => {
      setIsFavorite(snapshot.exists());
    });

    return () => unsubscribe();
  }, [movie.imdbID, currentUser]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      alert("Please sign in to add favorites");
      return;
    }

    const favRef = ref(database, `favorites/${currentUser.uid}/${movie.imdbID}`);
    
    try {
      if (isFavorite) {
        setIsRemoving(true);
        await remove(favRef);
        
        // Call onRemove callback after successful removal
        if (showRemoveOption && onRemove) {
          setTimeout(() => {
            onRemove(movie.imdbID);
          }, 300);
        }
      } else {
        await set(favRef, {
          imdbID: movie.imdbID,
          Title: movie.Title,
          Year: movie.Year,
          Poster: movie.Poster,
          Type: movie.Type,
          addedAt: Date.now()
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      console.error("Error details:", error.message);
      alert("Failed to update favorites. Please try again. Error: " + error.message);
    } finally {
      setTimeout(() => setIsRemoving(false), 300);
    }
  };

  return (
    <div className={`movie-card-wrapper ${isRemoving ? 'removing' : ''}`}>
      <div className="movie-card">
        <div className="movie-poster-container">
          <img
            src={movie.Poster !== "N/A" ? movie.Poster : "/no-image.png"}
            className="movie-poster"
            alt={movie.Title}
            loading="lazy"
          />
          <div className="movie-overlay">
            <Link to={`/movie/${movie.imdbID}`} className="view-details-btn">
              View Details
            </Link>
          </div>
          <button 
            className={`favorite-btn ${isFavorite ? 'is-favorite' : ''} ${!currentUser ? 'disabled' : ''}`}
            onClick={toggleFavorite}
            title={!currentUser ? 'Sign in to add favorites' : isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            disabled={!currentUser}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
        
        <div className="movie-info">
          <h3 className="movie-title">{movie.Title}</h3>
          <div className="movie-meta">
            <span className="movie-year">{movie.Year}</span>
            {movie.Type && (
              <>
                <span className="meta-divider">•</span>
                <span className="movie-type">{movie.Type.charAt(0).toUpperCase() + movie.Type.slice(1)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .movie-card-wrapper {
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .movie-card-wrapper.removing {
          opacity: 0;
          transform: scale(0.9);
        }

        .movie-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .movie-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
        }

        .movie-poster-container {
          position: relative;
          width: 100%;
          padding-top: 150%; /* 2:3 aspect ratio */
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .movie-poster {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .movie-card:hover .movie-poster {
          transform: scale(1.05);
        }

        .movie-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .movie-card:hover .movie-overlay {
          opacity: 1;
        }

        .view-details-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .view-details-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          color: white;
        }

        .favorite-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          z-index: 10;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .favorite-btn:hover:not(.disabled) {
          transform: scale(1.1);
          background: rgba(255, 255, 255, 1);
        }

        .favorite-btn.is-favorite {
          background: rgba(255, 107, 107, 0.95);
          animation: heartbeat 0.5s ease;
        }

        .favorite-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .movie-info {
          padding: 1.25rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .movie-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #2c3e50;
          margin: 0 0 0.75rem 0;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          line-height: 1.4;
          min-height: 2.8em;
        }

        .movie-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #7f8c8d;
          margin-top: auto;
        }

        .movie-year {
          font-weight: 600;
          color: #ff6b6b;
        }

        .meta-divider {
          color: #bdc3c7;
        }

        .movie-type {
          text-transform: capitalize;
          color: #95a5a6;
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.2); }
          50% { transform: scale(1); }
          75% { transform: scale(1.1); }
        }

        @media (max-width: 768px) {
          .movie-title {
            font-size: 1rem;
          }

          .movie-info {
            padding: 1rem;
          }

          .favorite-btn {
            width: 36px;
            height: 36px;
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
}









// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { database, auth } from "../firebase/firebase";
// import { ref, set, remove, onValue } from "firebase/database";

// export default function MovieCard({ movie, showRemoveOption = false, onRemove }) {
//   const [isFavorite, setIsFavorite] = useState(false);
//   const [isRemoving, setIsRemoving] = useState(false);

//   useEffect(() => {
//     const user = auth.currentUser;
//     if (!user) return;

//     const favRef = ref(database, `favorites/${user.uid}/${movie.imdbID}`);
//     const unsubscribe = onValue(favRef, (snapshot) => {
//       setIsFavorite(snapshot.exists());
//     });

//     return () => unsubscribe();
//   }, [movie.imdbID]);

//   const toggleFavorite = async (e) => {
//     e.preventDefault();
//     e.stopPropagation();
    
//     const user = auth.currentUser;
//     if (!user) {
//       alert("Please sign in to add favorites");
//       return;
//     }

//     const favRef = ref(database, `favorites/${user.uid}/${movie.imdbID}`);
    
//     try {
//       if (isFavorite) {
//         setIsRemoving(true);
//         await remove(favRef);
        
//         // Call onRemove callback after successful removal
//         if (showRemoveOption && onRemove) {
//           setTimeout(() => {
//             onRemove(movie.imdbID);
//           }, 300);
//         }
//       } else {
//         await set(favRef, {
//           imdbID: movie.imdbID,
//           Title: movie.Title,
//           Year: movie.Year,
//           Poster: movie.Poster,
//           Type: movie.Type,
//           addedAt: Date.now()
//         });
//       }
//     } catch (error) {
//       console.error("Error toggling favorite:", error);
//       alert("Failed to update favorites. Please try again.");
//     } finally {
//       setTimeout(() => setIsRemoving(false), 300);
//     }
//   };

//   return (
//     <div className={`movie-card-wrapper ${isRemoving ? 'removing' : ''}`}>
//       <div className="movie-card">
//         <div className="movie-poster-container">
//           <img
//             src={movie.Poster !== "N/A" ? movie.Poster : "/no-image.png"}
//             className="movie-poster"
//             alt={movie.Title}
//             loading="lazy"
//           />
//           <div className="movie-overlay">
//             <Link to={`/movie/${movie.imdbID}`} className="view-details-btn">
//               View Details
//             </Link>
//           </div>
//           <button 
//             className={`favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
//             onClick={toggleFavorite}
//             title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
//           >
//             {isFavorite ? '❤️' : '🤍'}
//           </button>
//         </div>
        
//         <div className="movie-info">
//           <h3 className="movie-title">{movie.Title}</h3>
//           <div className="movie-meta">
//             <span className="movie-year">{movie.Year}</span>
//             {movie.Type && (
//               <>
//                 <span className="meta-divider">•</span>
//                 <span className="movie-type">{movie.Type.charAt(0).toUpperCase() + movie.Type.slice(1)}</span>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         .movie-card-wrapper {
//           transition: opacity 0.3s ease, transform 0.3s ease;
//         }

//         .movie-card-wrapper.removing {
//           opacity: 0;
//           transform: scale(0.9);
//         }

//         .movie-card {
//           background: white;
//           border-radius: 16px;
//           overflow: hidden;
//           box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
//           transition: all 0.3s ease;
//           height: 100%;
//           display: flex;
//           flex-direction: column;
//         }

//         .movie-card:hover {
//           transform: translateY(-8px);
//           box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
//         }

//         .movie-poster-container {
//           position: relative;
//           width: 100%;
//           padding-top: 150%; /* 2:3 aspect ratio */
//           overflow: hidden;
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//         }

//         .movie-poster {
//           position: absolute;
//           top: 0;
//           left: 0;
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//           transition: transform 0.3s ease;
//         }

//         .movie-card:hover .movie-poster {
//           transform: scale(1.05);
//         }

//         .movie-overlay {
//           position: absolute;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background: rgba(0, 0, 0, 0.7);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           opacity: 0;
//           transition: opacity 0.3s ease;
//         }

//         .movie-card:hover .movie-overlay {
//           opacity: 1;
//         }

//         .view-details-btn {
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           color: white;
//           text-decoration: none;
//           padding: 0.75rem 1.5rem;
//           border-radius: 25px;
//           font-weight: 600;
//           font-size: 0.9rem;
//           transition: all 0.3s ease;
//           box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
//         }

//         .view-details-btn:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
//           color: white;
//         }

//         .favorite-btn {
//           position: absolute;
//           top: 12px;
//           right: 12px;
//           background: rgba(255, 255, 255, 0.9);
//           border: none;
//           width: 40px;
//           height: 40px;
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           cursor: pointer;
//           font-size: 1.2rem;
//           transition: all 0.3s ease;
//           z-index: 10;
//           backdrop-filter: blur(10px);
//           box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
//         }

//         .favorite-btn:hover {
//           transform: scale(1.1);
//           background: rgba(255, 255, 255, 1);
//         }

//         .favorite-btn.is-favorite {
//           background: rgba(255, 107, 107, 0.95);
//           animation: heartbeat 0.5s ease;
//         }

//         .movie-info {
//           padding: 1.25rem;
//           flex: 1;
//           display: flex;
//           flex-direction: column;
//         }

//         .movie-title {
//           font-size: 1.1rem;
//           font-weight: 700;
//           color: #2c3e50;
//           margin: 0 0 0.75rem 0;
//           overflow: hidden;
//           text-overflow: ellipsis;
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           line-height: 1.4;
//           min-height: 2.8em;
//         }

//         .movie-meta {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           font-size: 0.875rem;
//           color: #7f8c8d;
//           margin-top: auto;
//         }

//         .movie-year {
//           font-weight: 600;
//           color: #ff6b6b;
//         }

//         .meta-divider {
//           color: #bdc3c7;
//         }

//         .movie-type {
//           text-transform: capitalize;
//           color: #95a5a6;
//         }

//         @keyframes heartbeat {
//           0%, 100% { transform: scale(1); }
//           25% { transform: scale(1.2); }
//           50% { transform: scale(1); }
//           75% { transform: scale(1.1); }
//         }

//         @media (max-width: 768px) {
//           .movie-title {
//             font-size: 1rem;
//           }

//           .movie-info {
//             padding: 1rem;
//           }

//           .favorite-btn {
//             width: 36px;
//             height: 36px;
//             font-size: 1.1rem;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }



















// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { auth, database } from "../firebase/firebase";
// import { ref, set, remove, onValue } from "firebase/database";

// export default function MovieCard({ movie }) {
//   const navigate = useNavigate();
//   const [liked, setLiked] = useState(false);
//   const [user, setUser] = useState(null);
//   const [isToggling, setIsToggling] = useState(false);

//   // Create a consistent ID for Firebase (works with TMDB and OMDb)
//   const movieId = movie.imdbID || movie.id?.toString();

//   // Standardize poster image
//   const posterUrl =
//     movie.poster_path
//       ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
//       : movie.Poster && movie.Poster !== "N/A"
//       ? movie.Poster
//       : "https://via.placeholder.com/400x600?text=No+Image";

//   // Monitor authentication state
//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribe();
//   }, []);

//   // ✅ Real-time sync: check if liked in Firebase
//   useEffect(() => {
//     if (!user || !movieId) {
//       setLiked(false);
//       return;
//     }

//     const favRef = ref(database, `favorites/${user.uid}/${movieId}`);

//     const unsubscribe = onValue(
//       favRef,
//       (snapshot) => {
//         setLiked(snapshot.exists());
//         console.log("🔵 Listener fired - exists:", snapshot.exists());
//       },
//       (error) => {
//         console.error("❌ Listener error:", error);
//       }
//     );

//     return () => unsubscribe();
//   }, [user, movieId]);

//   // ✅ Toggle like/unlike
//   const toggleLike = async (e) => {
//     e.stopPropagation();

//     console.log("🔵 Toggle Like clicked");
//     console.log("🔵 User:", user);
//     console.log("🔵 Movie ID:", movieId);
//     console.log("🔵 Current liked state:", liked);

//     if (!user) {
//       alert("Please sign in to add favorites.");
//       return;
//     }

//     if (!movieId) {
//       alert("Unable to add this movie to favorites.");
//       return;
//     }

//     // Prevent multiple clicks
//     if (isToggling) {
//       console.log("🔵 Already toggling, ignoring click");
//       return;
//     }

//     setIsToggling(true);
//     const favRef = ref(database, `favorites/${user.uid}/${movieId}`);
//     console.log("🔵 Firebase path:", `favorites/${user.uid}/${movieId}`);

//     try {
//       if (liked) {
//         // Unlike → remove from Firebase
//         console.log("🔵 Attempting to remove from favorites...");
//         await remove(favRef);
//         console.log("✅ Successfully removed from favorites:", movieId);
//       } else {
//         // Like → add to Firebase
//         const movieData = {
//           imdbID: movieId,
//           id: movie.id?.toString() || movieId,
//           Title: movie.title || movie.Title,
//           title: movie.title || movie.Title,
//           Year: movie.release_date
//             ? movie.release_date.split("-")[0]
//             : movie.Year || "N/A",
//           release_date: movie.release_date || null,
//           Poster: posterUrl,
//           poster_path: movie.poster_path || null,
//           Type: movie.Type || "movie",
//           vote_average: movie.vote_average || null,
//           addedAt: Date.now(),
//         };

//         console.log("🔵 Attempting to add to favorites...");
//         console.log("🔵 Movie data:", movieData);
//         await set(favRef, movieData);
//         console.log("✅ Successfully added to favorites:", movieId);
//       }
//     } catch (error) {
//       console.error("❌ ERROR toggling favorite:", error);
//       console.error("❌ Error details:", {
//         name: error.name,
//         message: error.message,
//         code: error.code,
//         stack: error.stack
//       });
//       alert(`Failed to update favorites: ${error.message}`);
//     } finally {
//       // Allow clicking again after a short delay
//       setTimeout(() => {
//         setIsToggling(false);
//       }, 500);
//     }
//   };

//   // ✅ Navigate to movie details
//   const handleClick = () => {
//     const detailId = movie.id || movie.imdbID;
//     if (detailId) {
//       navigate(`/movie/${detailId}`);
//     }
//   };

//   return (
//     <div
//       className="card shadow-sm m-2 movie-card position-relative"
//       style={{
//         width: "12rem",
//         borderRadius: "15px",
//         overflow: "hidden",
//         cursor: "pointer",
//         transition: "transform 0.3s ease",
//       }}
//       onClick={handleClick}
//       onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
//       onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
//     >
//       {/* ❤️ Like Button */}
//       <button
//         className="btn btn-light position-absolute"
//         onClick={toggleLike}
//         disabled={isToggling}
//         style={{
//           top: "10px",
//           right: "10px",
//           borderRadius: "50%",
//           width: "36px",
//           height: "36px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
//           zIndex: 5,
//           border: "none",
//           backgroundColor: "white",
//           opacity: isToggling ? 0.6 : 1,
//           cursor: isToggling ? "not-allowed" : "pointer",
//         }}
//         title={liked ? "Remove from favorites" : "Add to favorites"}
//       >
//         <span style={{ fontSize: "1.2rem" }}>
//           {liked ? "❤️" : "🤍"}
//         </span>
//       </button>

//       <img
//         src={posterUrl}
//         className="card-img-top"
//         alt={movie.title || movie.Title}
//         style={{ height: "18rem", objectFit: "cover" }}
//       />

//       <div className="card-body text-center">
//         <h6 className="card-title text-truncate">{movie.title || movie.Title}</h6>
//         <p className="card-text text-muted" style={{ fontSize: "0.85rem" }}>
//           ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"} / 10
//         </p>
//       </div>
//     </div>
//   );
// }










// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { auth, database } from "../firebase/firebase";
// import { ref, set, remove, onValue } from "firebase/database";

// export default function MovieCard({ movie }) {
//   const navigate = useNavigate();
//   const [liked, setLiked] = useState(false);
//   const [user, setUser] = useState(null);

//   // Create a consistent ID for Firebase (works with TMDB and OMDb)
//   const movieId = movie.imdbID || movie.id?.toString();

//   // Standardize poster image
//   const posterUrl =
//     movie.poster_path
//       ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
//       : movie.Poster && movie.Poster !== "N/A"
//       ? movie.Poster
//       : "https://via.placeholder.com/400x600?text=No+Image";

//   // Monitor authentication state
//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribe();
//   }, []);

//   // ✅ Real-time sync: check if liked in Firebase
//   useEffect(() => {
//     if (!user || !movieId) {
//       setLiked(false);
//       return;
//     }

//     const favRef = ref(database, `favorites/${user.uid}/${movieId}`);

//     const unsubscribe = onValue(favRef, (snapshot) => {
//       setLiked(snapshot.exists());
//     });

//     return () => unsubscribe();
//   }, [user, movieId]);

//   // ✅ Toggle like/unlike
//   const toggleLike = async (e) => {
//     e.stopPropagation();

//     console.log("🔵 Toggle Like clicked");
//     console.log("🔵 User:", user);
//     console.log("🔵 Movie ID:", movieId);
//     console.log("🔵 Current liked state:", liked);

//     if (!user) {
//       alert("Please sign in to add favorites.");
//       return;
//     }

//     if (!movieId) {
//       alert("Unable to add this movie to favorites.");
//       return;
//     }

//     const favRef = ref(database, `favorites/${user.uid}/${movieId}`);
//     console.log("🔵 Firebase path:", `favorites/${user.uid}/${movieId}`);

//     try {
//       if (liked) {
//         // Unlike → remove from Firebase
//         console.log("🔵 Attempting to remove from favorites...");
//         await remove(favRef);
//         console.log("✅ Successfully removed from favorites:", movieId);
//       } else {
//         // Like → add to Firebase
//         const movieData = {
//           imdbID: movieId,
//           id: movie.id?.toString() || movieId,
//           Title: movie.title || movie.Title,
//           title: movie.title || movie.Title,
//           Year: movie.release_date
//             ? movie.release_date.split("-")[0]
//             : movie.Year || "N/A",
//           release_date: movie.release_date || null,
//           Poster: posterUrl,
//           poster_path: movie.poster_path || null,
//           Type: movie.Type || "movie",
//           vote_average: movie.vote_average || null,
//           addedAt: Date.now(),
//         };

//         console.log("🔵 Attempting to add to favorites...");
//         console.log("🔵 Movie data:", movieData);
//         await set(favRef, movieData);
//         console.log("✅ Successfully added to favorites:", movieId);
//       }
//     } catch (error) {
//       console.error("❌ ERROR toggling favorite:", error);
//       console.error("❌ Error name:", error.name);
//       console.error("❌ Error message:", error.message);
//       console.error("❌ Error code:", error.code);
//       alert(`Failed to update favorites: ${error.message}`);
//     }
//   };

//   // ✅ Navigate to movie details
//   const handleClick = () => {
//     const detailId = movie.id || movie.imdbID;
//     if (detailId) {
//       navigate(`/movie/${detailId}`);
//     }
//   };

//   return (
//     <div
//       className="card shadow-sm m-2 movie-card position-relative"
//       style={{
//         width: "12rem",
//         borderRadius: "15px",
//         overflow: "hidden",
//         cursor: "pointer",
//         transition: "transform 0.3s ease",
//       }}
//       onClick={handleClick}
//       onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
//       onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
//     >
//       {/* ❤️ Like Button */}
//       <button
//         className="btn btn-light position-absolute"
//         onClick={toggleLike}
//         style={{
//           top: "10px",
//           right: "10px",
//           borderRadius: "50%",
//           width: "36px",
//           height: "36px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
//           zIndex: 5,
//           border: "none",
//           backgroundColor: "white",
//         }}
//         title={liked ? "Remove from favorites" : "Add to favorites"}
//       >
//         <span style={{ fontSize: "1.2rem" }}>
//           {liked ? "❤️" : "🤍"}
//         </span>
//       </button>

//       <img
//         src={posterUrl}
//         className="card-img-top"
//         alt={movie.title || movie.Title}
//         style={{ height: "18rem", objectFit: "cover" }}
//       />

//       <div className="card-body text-center">
//         <h6 className="card-title text-truncate">{movie.title || movie.Title}</h6>
//         <p className="card-text text-muted" style={{ fontSize: "0.85rem" }}>
//           ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"} / 10
//         </p>
//       </div>
//     </div>
//   );
// }









// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { auth, database } from "../firebase/firebase";
// import { ref, set, remove, onValue } from "firebase/database";

// export default function MovieCard({ movie }) {
//   const navigate = useNavigate();
//   const [liked, setLiked] = useState(false);
//   const [user, setUser] = useState(null);

//   // Create a consistent ID for Firebase (works with TMDB and OMDb)
//   const movieId = movie.imdbID || movie.id?.toString();

//   // Standardize poster image
//   const posterUrl =
//     movie.poster_path
//       ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
//       : movie.Poster && movie.Poster !== "N/A"
//       ? movie.Poster
//       : "https://via.placeholder.com/400x600?text=No+Image";

//   // Monitor authentication state
//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribe();
//   }, []);

//   // ✅ Real-time sync: check if liked in Firebase
//   useEffect(() => {
//     if (!user || !movieId) {
//       setLiked(false);
//       return;
//     }

//     const favRef = ref(database, `favorites/${user.uid}/${movieId}`);

//     const unsubscribe = onValue(favRef, (snapshot) => {
//       setLiked(snapshot.exists());
//     });

//     return () => unsubscribe();
//   }, [user, movieId]);

//   // ✅ Toggle like/unlike
//   const toggleLike = async (e) => {
//     e.stopPropagation();

//     if (!user) {
//       alert("Please sign in to add favorites.");
//       return;
//     }

//     if (!movieId) {
//       alert("Unable to add this movie to favorites.");
//       return;
//     }

//     const favRef = ref(database, `favorites/${user.uid}/${movieId}`);

//     try {
//       if (liked) {
//         // Unlike → remove from Firebase
//         await remove(favRef);
//         console.log("Removed from favorites:", movieId);
//       } else {
//         // Like → add to Firebase
//         const movieData = {
//           imdbID: movieId,
//           id: movie.id?.toString() || movieId,
//           Title: movie.title || movie.Title,
//           title: movie.title || movie.Title,
//           Year: movie.release_date
//             ? movie.release_date.split("-")[0]
//             : movie.Year || "N/A",
//           release_date: movie.release_date || null,
//           Poster: posterUrl,
//           poster_path: movie.poster_path || null,
//           Type: movie.Type || "movie",
//           vote_average: movie.vote_average || null,
//           addedAt: Date.now(),
//         };

//         await set(favRef, movieData);
//         console.log("Added to favorites:", movieId, movieData);
//       }
//     } catch (error) {
//       console.error("Error toggling favorite:", error);
//       alert("Failed to update favorites. Please try again.");
//     }
//   };

//   // ✅ Navigate to movie details
//   const handleClick = () => {
//     const detailId = movie.id || movie.imdbID;
//     if (detailId) {
//       navigate(`/movie/${detailId}`);
//     }
//   };

//   return (
//     <div
//       className="card shadow-sm m-2 movie-card position-relative"
//       style={{
//         width: "12rem",
//         borderRadius: "15px",
//         overflow: "hidden",
//         cursor: "pointer",
//         transition: "transform 0.3s ease",
//       }}
//       onClick={handleClick}
//       onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
//       onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
//     >
//       {/* ❤️ Like Button */}
//       <button
//         className="btn btn-light position-absolute"
//         onClick={toggleLike}
//         style={{
//           top: "10px",
//           right: "10px",
//           borderRadius: "50%",
//           width: "36px",
//           height: "36px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
//           zIndex: 5,
//           border: "none",
//           backgroundColor: "white",
//         }}
//         title={liked ? "Remove from favorites" : "Add to favorites"}
//       >
//         <span style={{ fontSize: "1.2rem" }}>
//           {liked ? "❤️" : "🤍"}
//         </span>
//       </button>

//       <img
//         src={posterUrl}
//         className="card-img-top"
//         alt={movie.title || movie.Title}
//         style={{ height: "18rem", objectFit: "cover" }}
//       />

//       <div className="card-body text-center">
//         <h6 className="card-title text-truncate">{movie.title || movie.Title}</h6>
//         <p className="card-text text-muted" style={{ fontSize: "0.85rem" }}>
//           ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"} / 10
//         </p>
//       </div>
//     </div>
//   );
// }










// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { auth, database } from "../firebase/firebase";
// import { ref, set, remove, onValue } from "firebase/database";

// export default function MovieCard({ movie }) {
//   const navigate = useNavigate();
//   const [liked, setLiked] = useState(false);
//   const user = auth.currentUser;

//   // Create a consistent ID for Firebase (works with TMDB and OMDb)
//   const movieId = movie.imdbID || movie.id;

//   // Standardize poster image
//   const posterUrl =
//     movie.poster_path
//       ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
//       : movie.Poster && movie.Poster !== "N/A"
//       ? movie.Poster
//       : "https://via.placeholder.com/400x600?text=No+Image";

//   // ✅ Real-time sync: check if liked in Firebase
//   useEffect(() => {
//     if (!user || !movieId) return;

//     const favRef = ref(database, `favorites/${user.uid}/${movieId}`);

//     const unsubscribe = onValue(favRef, (snapshot) => {
//       setLiked(snapshot.exists());
//     });

//     return () => unsubscribe();
//   }, [user, movieId]);

//   // ✅ Toggle like/unlike
//   const toggleLike = async (e) => {
//     e.stopPropagation();

//     if (!user) {
//       alert("Please sign in to add favorites.");
//       return;
//     }

//     const favRef = ref(database, `favorites/${user.uid}/${movieId}`);

//     if (liked) {
//       // Unlike → remove from Firebase
//       await remove(favRef);
//     } else {
//       // Like → add to Firebase
//       const movieData = {
//         imdbID: movie.imdbID || movie.id?.toString(),
//         id: movie.id || movie.imdbID,
//         Title: movie.title || movie.Title,
//         title: movie.title || movie.Title,
//         Year: movie.release_date
//           ? movie.release_date.split("-")[0]
//           : movie.Year || "N/A",
//         release_date: movie.release_date || null,
//         Poster: posterUrl,
//         poster_path: movie.poster_path || null,
//         Type: movie.Type || "movie",
//         vote_average: movie.vote_average || null,
//         addedAt: Date.now(),
//       };

//       await set(favRef, movieData);
//     }
//   };

//   // ✅ Navigate to movie details
//   const handleClick = () => {
//     navigate(`/movie/${movie.id || movie.imdbID}`);
//   };

//   return (
//     <div
//       className="card shadow-sm m-2 movie-card position-relative"
//       style={{
//         width: "12rem",
//         borderRadius: "15px",
//         overflow: "hidden",
//         cursor: "pointer",
//         transition: "transform 0.3s ease",
//       }}
//       onClick={handleClick}
//       onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
//       onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
//     >
//       {/* ❤️ Like Button */}
//       <button
//         className="btn btn-light position-absolute"
//         onClick={toggleLike}
//         style={{
//           top: "10px",
//           right: "10px",
//           borderRadius: "50%",
//           width: "36px",
//           height: "36px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
//           zIndex: 5,
//         }}
//       >
//         <span style={{ fontSize: "1.2rem" }}>
//           {liked ? "❤️" : "🤍"}
//         </span>
//       </button>

//       <img
//         src={posterUrl}
//         className="card-img-top"
//         alt={movie.title || movie.Title}
//         style={{ height: "18rem", objectFit: "cover" }}
//       />

//       <div className="card-body text-center">
//         <h6 className="card-title text-truncate">{movie.title || movie.Title}</h6>
//         <p className="card-text text-muted" style={{ fontSize: "0.85rem" }}>
//           ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"} / 10
//         </p>
//       </div>
//     </div>
//   );
// }









// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { auth, database } from "../firebase/firebase";
// import { ref, set, remove, onValue } from "firebase/database";

// export default function MovieCard({ movie }) {
//   const navigate = useNavigate();
//   const [liked, setLiked] = useState(false);
//   const user = auth.currentUser;

//   // Create a consistent ID for Firebase (works with TMDB and OMDb)
//   const movieId = movie.imdbID || movie.id;

//   // Standardize poster image
//   const posterUrl =
//     movie.poster_path
//       ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
//       : movie.Poster && movie.Poster !== "N/A"
//       ? movie.Poster
//       : "https://via.placeholder.com/400x600?text=No+Image";

//   // ✅ Real-time sync: check if liked in Firebase
//   useEffect(() => {
//     if (!user || !movieId) return;

//     const favRef = ref(database, `favorites/${user.uid}/${movieId}`);

//     const unsubscribe = onValue(favRef, (snapshot) => {
//       setLiked(snapshot.exists());
//     });

//     return () => unsubscribe();
//   }, [user, movieId]);

//   // ✅ Toggle like/unlike
//   const toggleLike = async (e) => {
//     e.stopPropagation();

//     if (!user) {
//       alert("Please sign in to add favorites.");
//       return;
//     }

//     const favRef = ref(database, `favorites/${user.uid}/${movieId}`);

//     if (liked) {
//       // Unlike → remove from Firebase
//       await remove(favRef);
//     } else {
//       // Like → add to Firebase
//       const movieData = {
//         imdbID: movie.imdbID || movie.id,
//         Title: movie.title || movie.Title,
//         Year: movie.release_date
//           ? movie.release_date.split("-")[0]
//           : movie.Year || "N/A",
//         Poster: posterUrl,
//         Type: movie.Type || "movie",
//         vote_average: movie.vote_average || null,
//         addedAt: Date.now(),
//       };

//       await set(favRef, movieData);
//     }
//   };

//   // ✅ Navigate to movie details
//   const handleClick = () => {
//     navigate(`/movie/${movie.id || movie.imdbID}`);
//   };

//   return (
//     <div
//       className="card shadow-sm m-2 movie-card position-relative"
//       style={{
//         width: "12rem",
//         borderRadius: "15px",
//         overflow: "hidden",
//         cursor: "pointer",
//         transition: "transform 0.3s ease",
//       }}
//       onClick={handleClick}
//       onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
//       onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
//     >
//       {/* ❤️ Like Button */}
//       <button
//         className="btn btn-light position-absolute"
//         onClick={toggleLike}
//         style={{
//           top: "10px",
//           right: "10px",
//           borderRadius: "50%",
//           width: "36px",
//           height: "36px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
//           zIndex: 5,
//         }}
//       >
//         <span style={{ fontSize: "1.2rem" }}>
//           {liked ? "❤️" : "🤍"}
//         </span>
//       </button>

//       <img
//         src={posterUrl}
//         className="card-img-top"
//         alt={movie.title || movie.Title}
//         style={{ height: "18rem", objectFit: "cover" }}
//       />

//       <div className="card-body text-center">
//         <h6 className="card-title text-truncate">{movie.title || movie.Title}</h6>
//         <p className="card-text text-muted" style={{ fontSize: "0.85rem" }}>
//           ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"} / 10
//         </p>
//       </div>
//     </div>
//   );
// }













// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function MovieCard({ movie }) {
//   const navigate = useNavigate();
//   const [liked, setLiked] = useState(false);

//   const handleClick = () => {
//     navigate(`/movie/${movie.id}`);
//   };

//   const toggleLike = (e) => {
//     e.stopPropagation(); // prevent opening details when clicking the heart
//     setLiked(!liked);
//   };

//   const posterUrl = movie.poster_path
//     ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
//     : "https://via.placeholder.com/400x600?text=No+Image";

//   return (
//     <div
//       className="card shadow-sm m-2 movie-card position-relative"
//       style={{
//         width: "12rem",
//         borderRadius: "15px",
//         overflow: "hidden",
//         cursor: "pointer",
//         transition: "transform 0.3s ease",
//       }}
//       onClick={handleClick}
//       onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
//       onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
//     >
//       {/* Favorite Heart Button */}
//       <button
//         className="btn btn-light position-absolute"
//         onClick={toggleLike}
//         style={{
//           top: "10px",
//           right: "10px",
//           borderRadius: "50%",
//           width: "36px",
//           height: "36px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
//           zIndex: 5,
//         }}
//       >
//         <i
//           className={`bi ${liked ? "bi-heart-fill text-danger" : "bi-heart"}`}
//           style={{ fontSize: "1.2rem" }}
//         ></i>
//       </button>

//       <img
//         src={posterUrl}
//         className="card-img-top"
//         alt={movie.title}
//         style={{ height: "18rem", objectFit: "cover" }}
//       />

//       <div className="card-body text-center">
//         <h6 className="card-title text-truncate">{movie.title}</h6>
//         <p className="card-text text-muted" style={{ fontSize: "0.85rem" }}>
//           ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"} / 10
//         </p>
//       </div>
//     </div>
//   );
// }














// import React from "react";
// import { useNavigate } from "react-router-dom";

// export default function MovieCard({ movie }) {
//   const navigate = useNavigate();

//   const handleClick = () => {
//     navigate(`/movie/${movie.id}`);
//   };

//   const posterUrl = movie.poster_path
//     ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
//     : "https://via.placeholder.com/400x600?text=No+Image";

//   return (
//     <div
//       className="card shadow-sm m-2 movie-card"
//       style={{
//         width: "12rem",
//         borderRadius: "15px",
//         overflow: "hidden",
//         cursor: "pointer",
//         transition: "transform 0.3s ease",
//       }}
//       onClick={handleClick}
//       onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
//       onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
//     >
//       <img
//         src={posterUrl}
//         className="card-img-top"
//         alt={movie.title}
//         style={{ height: "18rem", objectFit: "cover" }}
//       />
//       <div className="card-body text-center">
//         <h6 className="card-title text-truncate">{movie.title}</h6>
//         <p className="card-text text-muted" style={{ fontSize: "0.85rem" }}>
//           ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"} / 10
//         </p>
//       </div>
//     </div>
//   );
// }










// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { database, auth } from "../firebase/firebase";
// import { ref, set, remove, onValue } from "firebase/database";

// export default function MovieCard({ movie, showRemoveOption = false, onRemove }) {
//   const [isFavorite, setIsFavorite] = useState(false);

//   useEffect(() => {
//     const user = auth.currentUser;
//     if (!user) return;

//     const favRef = ref(database, `favorites/${user.uid}/${movie.imdbID}`);
//     onValue(favRef, (snapshot) => {
//       setIsFavorite(snapshot.exists());
//     });
//   }, [movie.imdbID]);

//   const toggleFavorite = async (e) => {
//     e.preventDefault(); // Prevent navigation when clicking the button
//     const user = auth.currentUser;
//     if (!user) return;

//     const favRef = ref(database, `favorites/${user.uid}/${movie.imdbID}`);
    
//     if (isFavorite) {
//       await remove(favRef);
//       if (showRemoveOption && onRemove) {
//         onRemove(movie.imdbID);
//       }
//     } else {
//       await set(favRef, {
//         imdbID: movie.imdbID,
//         Title: movie.Title,
//         Year: movie.Year,
//         Poster: movie.Poster,
//         Type: movie.Type
//       });
//     }
//   };

//   return (
//     <div className="col-md-3 mb-4">
//       <div className="card h-100 shadow-sm" style={{ width: "250px" , height: "250px"}}>
//         <div className="position-relative">
//           <img
//             src={movie.Poster !== "N/A" ? movie.Poster : "/no-image.png"}
//             className="card-img-top"
//             alt={movie.Title}
//             style={{ height: "350px", objectFit: "cover" }}
//           />
//           <button 
//             className={`btn btn-sm position-absolute top-0 end-0 m-2 ${
//               isFavorite ? 'btn-danger' : 'btn-outline-light'
//             }`}
//             onClick={toggleFavorite}
//             style={{ zIndex: 1 ,}}
//           >
//             {isFavorite ? '❤️' : '🤍'}
//           </button>
//         </div>
//         <div className="card-body d-flex flex-column">
//           <h5 className="card-title" style={{ 
//             fontSize: "1rem", 
//             overflow: "hidden", 
//             textOverflow: "ellipsis",
//             display: "-webkit-box",
//             WebkitLineClamp: 2,
//             WebkitBoxOrient: "vertical",
            
//           }}>
//             {movie.Title}
//           </h5>
//           <p className="card-text">
//             <small className="text-muted">Year: {movie.Year}</small>
//           </p>
//           <div className="mt-auto">
//             <Link to={`/movie/${movie.imdbID}`} className="btn btn-primary btn-sm w-100">
//               View Details
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }









// import React from "react";
// import { Link } from "react-router-dom";

// export default function MovieCard({ movie }) {
//   return (
//     <div className="col-md-3 mb-4">
//       <div className="card h-100 shadow-sm">
//         <img
//           src={movie.Poster !== "N/A" ? movie.Poster : "/no-image.png"}
//           className="card-img-top"
//           alt={movie.Title}
//         />
//         <div className="card-body">
//           <h5 className="card-title">{movie.Title}</h5>
//           <p className="card-text">Year: {movie.Year}</p>
//           <Link to={`/movie/${movie.imdbID}`} className="btn btn-primary">
//             View Details
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }
