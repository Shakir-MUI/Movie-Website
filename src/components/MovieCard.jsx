import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { database, auth } from "../firebase/firebase";
import { ref, set, remove, onValue } from "firebase/database";

export default function MovieCard({ movie, showRemoveOption = false, onRemove }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const favRef = ref(database, `favorites/${user.uid}/${movie.imdbID}`);
    onValue(favRef, (snapshot) => {
      setIsFavorite(snapshot.exists());
    });
  }, [movie.imdbID]);

  const toggleFavorite = async (e) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    const user = auth.currentUser;
    if (!user) return;

    const favRef = ref(database, `favorites/${user.uid}/${movie.imdbID}`);
    
    if (isFavorite) {
      await remove(favRef);
      if (showRemoveOption && onRemove) {
        onRemove(movie.imdbID);
      }
    } else {
      await set(favRef, {
        imdbID: movie.imdbID,
        Title: movie.Title,
        Year: movie.Year,
        Poster: movie.Poster,
        Type: movie.Type
      });
    }
  };

  return (
    <div className="col-md-3 mb-4">
      <div className="card h-100 shadow-sm" style={{ width: "250px" , height: "250px"}}>
        <div className="position-relative">
          <img
            src={movie.Poster !== "N/A" ? movie.Poster : "/no-image.png"}
            className="card-img-top"
            alt={movie.Title}
            style={{ height: "350px", objectFit: "cover" }}
          />
          <button 
            className={`btn btn-sm position-absolute top-0 end-0 m-2 ${
              isFavorite ? 'btn-danger' : 'btn-outline-light'
            }`}
            onClick={toggleFavorite}
            style={{ zIndex: 1 ,}}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title" style={{ 
            fontSize: "1rem", 
            overflow: "hidden", 
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            
          }}>
            {movie.Title}
          </h5>
          <p className="card-text">
            <small className="text-muted">Year: {movie.Year}</small>
          </p>
          <div className="mt-auto">
            <Link to={`/movie/${movie.imdbID}`} className="btn btn-primary btn-sm w-100">
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}









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
