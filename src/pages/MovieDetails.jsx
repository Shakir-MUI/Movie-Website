import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { database, auth } from "../firebase/firebase";
import { ref, set, remove, onValue } from "firebase/database";

const API_KEY = "a92f198";

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const url = `https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !movie) return;

    const favRef = ref(database, `favorites/${user.uid}/${id}`);
    const unsubscribe = onValue(favRef, (snapshot) => {
      setIsFavorite(snapshot.exists());
    });

    return () => unsubscribe();
  }, [id, movie]);

  const toggleFavorite = async () => {
    const user = auth.currentUser;
    if (!user || !movie) return;

    const favRef = ref(database, `favorites/${user.uid}/${id}`);
    
    try {
      if (isFavorite) {
        await remove(favRef);
      } else {
        await set(favRef, {
          imdbID: movie.imdbID,
          Title: movie.Title,
          Year: movie.Year,
          Poster: movie.Poster,
          Type: movie.Type
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleBackClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="movie-details-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (!movie || movie.Response === "False") {
    return (
      <div className="movie-details-container">
        <div className="error-container">
          <h2>Movie Not Found</h2>
          <p>Sorry, we couldn't find the movie you're looking for.</p>
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-details-container">
      {/* Hero Section with Background */}
      <div className="movie-hero" style={{
        backgroundImage: movie.Poster !== "N/A" ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${movie.Poster})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        {/* Navigation Bar */}
        <div className="movie-nav">
          <button 
            className="back-btn"
            onClick={handleBackClick}
            title="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
            </svg>
            Back
          </button>
          
          <button 
            className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
            onClick={toggleFavorite}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? '#ff4757' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {isFavorite ? 'Favorited' : 'Add to Favorites'}
          </button>
        </div>

        {/* Movie Title and Basic Info */}
        <div className="hero-content">
          <div className="movie-title-section">
            <h1 className="movie-title">{movie.Title}</h1>
            <div className="movie-meta">
              <span className="year">{movie.Year}</span>
              <span className="rating-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffd700">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {movie.imdbRating}/10
              </span>
              <span className="runtime">{movie.Runtime}</span>
            </div>
            <div className="genre-tags">
              {movie.Genre && movie.Genre.split(', ').map((genre, index) => (
                <span key={index} className="genre-tag">{genre}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Movie Details Content */}
      <div className="movie-content">
        <div className="content-grid">
          {/* Movie Poster */}
          <div className="poster-section">
            <div className="poster-container">
              <img 
                src={movie.Poster !== "N/A" ? movie.Poster : "/no-image.png"} 
                alt={movie.Title}
                className="movie-poster"
              />
            </div>
          </div>

          {/* Movie Information */}
          <div className="info-section">
            <div className="plot-section">
              <h3>Plot</h3>
              <p className="plot-text">{movie.Plot}</p>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <h4>Director</h4>
                <p>{movie.Director}</p>
              </div>
              
              <div className="detail-item">
                <h4>Cast</h4>
                <p>{movie.Actors}</p>
              </div>
              
              <div className="detail-item">
                <h4>Language</h4>
                <p>{movie.Language}</p>
              </div>
              
              <div className="detail-item">
                <h4>Country</h4>
                <p>{movie.Country}</p>
              </div>
              
              {movie.Awards && movie.Awards !== "N/A" && (
                <div className="detail-item awards">
                  <h4>Awards</h4>
                  <p>{movie.Awards}</p>
                </div>
              )}

              {movie.BoxOffice && movie.BoxOffice !== "N/A" && (
                <div className="detail-item">
                  <h4>Box Office</h4>
                  <p>{movie.BoxOffice}</p>
                </div>
              )}
            </div>

            {/* Additional Ratings */}
            {movie.Ratings && movie.Ratings.length > 0 && (
              <div className="ratings-section">
                <h4>Ratings</h4>
                <div className="ratings-grid">
                  {movie.Ratings.map((rating, index) => (
                    <div key={index} className="rating-item">
                      <span className="rating-source">{rating.Source}</span>
                      <span className="rating-value">{rating.Value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .movie-details-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .movie-hero {
          min-height: 60vh;
          position: relative;
          display: flex;
          flex-direction: column;
          color: white;
        }

        .movie-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          position: relative;
          z-index: 10;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .favorite-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .favorite-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .favorite-btn.favorited {
          background: rgba(255, 71, 87, 0.2);
          border-color: rgba(255, 71, 87, 0.3);
          color: #ff4757;
        }

        .hero-content {
          flex: 1;
          display: flex;
          align-items: flex-end;
          padding: 2rem;
        }

        .movie-title-section {
          max-width: 800px;
        }

        .movie-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          line-height: 1.2;
        }

        .movie-meta {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
        }

        .year {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 25px;
          backdrop-filter: blur(10px);
        }

        .rating-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 215, 0, 0.2);
          border-radius: 25px;
          backdrop-filter: blur(10px);
        }

        .runtime {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 25px;
          backdrop-filter: blur(10px);
        }

        .genre-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .genre-tag {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 25px;
          font-size: 0.9rem;
          backdrop-filter: blur(10px);
        }

        .movie-content {
          padding: 3rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 3rem;
          align-items: start;
        }

        .poster-container {
          position: sticky;
          top: 2rem;
        }

        .movie-poster {
          width: 100%;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease;
        }

        .movie-poster:hover {
          transform: scale(1.05);
        }

        .info-section {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .plot-section {
          margin-bottom: 2rem;
        }

        .plot-section h3 {
          color: #2c3e50;
          margin-bottom: 1rem;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .plot-text {
          color: #555;
          line-height: 1.6;
          font-size: 1.1rem;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .detail-item h4 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-item p {
          color: #666;
          line-height: 1.5;
        }

        .detail-item.awards {
          grid-column: 1 / -1;
        }

        .ratings-section h4 {
          color: #2c3e50;
          margin-bottom: 1rem;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .ratings-grid {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .rating-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 10px;
          min-width: 120px;
        }

        .rating-source {
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 0.25rem;
        }

        .rating-value {
          font-weight: 600;
          color: #2c3e50;
        }

        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .btn-primary {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 768px) {
          .movie-title {
            font-size: 2.5rem;
          }
          
          .content-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .movie-nav {
            padding: 1rem;
          }
          
          .hero-content {
            padding: 1rem;
          }
          
          .movie-content {
            padding: 2rem 1rem;
          }
          
          .details-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}










// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";

// const API_KEY = "a92f198"; // OMDB API Key

// export default function MovieDetails() {
//   const { id } = useParams();
//   const [movie, setMovie] = useState(null);

//   useEffect(() => {
//     const fetchMovie = async () => {
//       const url = `https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}`;
//       const res = await fetch(url);
//       const data = await res.json();
//       setMovie(data);
//     };
//     fetchMovie();
//   }, [id]);

//   if (!movie) {
//     return <div className="container mt-4">Loading...</div>;
//   }

//   return (
//     <div className="container mt-4">
//       <h2>{movie.Title}</h2>
//       <div className="row mt-3">
//         <div className="col-md-4">
//           <img src={movie.Poster !== "N/A" ? movie.Poster : "/no-image.png"} alt={movie.Title} className="img-fluid" />
//         </div>
//         <div className="col-md-8">
//           <p><strong>Year:</strong> {movie.Year}</p>
//           <p><strong>Genre:</strong> {movie.Genre}</p>
//           <p><strong>Director:</strong> {movie.Director}</p>
//           <p><strong>Actors:</strong> {movie.Actors}</p>
//           <p><strong>Plot:</strong> {movie.Plot}</p>
//           <p><strong>IMDB Rating:</strong> {movie.imdbRating}</p>
//         </div>
//       </div>
//     </div>
//   );
// }
