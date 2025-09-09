import React, { useEffect, useState } from "react";
import { database, auth } from "../firebase/firebase";
import { ref, onValue } from "firebase/database";
import MovieCard from "../components/MovieCard";
import { Link } from "react-router-dom";

export default function Favorites() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'alphabetical', 'year'

  useEffect(() => {
    const currentUser = auth.currentUser;
    setUser(currentUser);
    
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const favRef = ref(database, `favorites/${currentUser.uid}`);
    const unsubscribe = onValue(favRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let movieList = Object.values(data);
        setMovies(movieList);
      } else {
        setMovies([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRemoveFromFavorites = (movieId) => {
    setMovies(prev => prev.filter(movie => movie.imdbID !== movieId));
  };

  const getSortedMovies = () => {
    const sortedMovies = [...movies];
    
    switch (sortBy) {
      case 'alphabetical':
        return sortedMovies.sort((a, b) => a.Title.localeCompare(b.Title));
      case 'year':
        return sortedMovies.sort((a, b) => (b.Year || 0) - (a.Year || 0));
      case 'recent':
      default:
        return sortedMovies; // Keep original order (most recent first)
    }
  };

  const sortedMovies = getSortedMovies();

  if (loading) {
    return (
      <div className="favorites-container">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your favorite movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      {/* Header Section */}
      <div className="favorites-header">
        <div className="header-content">
          <div className="header-text">
            <div className="header-icon">❤️</div>
            <div>
              <h1 className="page-title">Your Favorite Movies</h1>
              <p className="page-subtitle">
                {movies.length === 0 
                  ? "Start building your collection" 
                  : `${movies.length} movie${movies.length !== 1 ? 's' : ''} in your collection`
                }
              </p>
            </div>
          </div>
          
          {movies.length > 0 && (
            <div className="header-controls">
              {/* View Toggle */}
              <div className="view-toggle">
                <button 
                  className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/>
                  </svg>
                </button>
                <button 
                  className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 6h18v2H3zM3 10h18v2H3zM3 14h18v2H3zM3 18h18v2H3z"/>
                  </svg>
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="sort-container">
                <label className="sort-label">Sort by:</label>
                <select 
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recent">Recently Added</option>
                  <option value="alphabetical">Title (A-Z)</option>
                  <option value="year">Year (Newest)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="favorites-content">
        {movies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">
              <div className="empty-heart">💔</div>
              <div className="empty-popcorn">🍿</div>
            </div>
            <h2 className="empty-title">No favorite movies yet</h2>
            <p className="empty-description">
              Discover amazing movies and add them to your favorites by clicking the heart icon
            </p>
            <Link to="/" className="explore-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Explore Movies
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="stats-bar">
              <div className="stats-item">
                <span className="stats-number">{movies.length}</span>
                <span className="stats-label">Total Movies</span>
              </div>
              <div className="stats-item">
                <span className="stats-number">
                  {new Set(movies.map(m => m.Year)).size}
                </span>
                <span className="stats-label">Different Years</span>
              </div>
              <div className="stats-item">
                <span className="stats-number">
                  {movies.filter(m => parseInt(m.Year) >= 2020).length}
                </span>
                <span className="stats-label">Recent Movies</span>
              </div>
            </div>

            {/* Movies Display */}
            {viewMode === 'grid' ? (
              <div className="movies-grid">
                {sortedMovies.map((movie) => (
                  <div key={movie.imdbID} className="grid-item">
                    <MovieCard 
                      movie={movie} 
                      showRemoveOption={true}
                      onRemove={handleRemoveFromFavorites}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="movies-list">
                {sortedMovies.map((movie, index) => (
                  <div key={movie.imdbID} className="list-item">
                    <div className="list-number">{index + 1}</div>
                    <div className="list-poster">
                      <img 
                        src={movie.Poster !== "N/A" ? movie.Poster : "/no-image.png"}
                        alt={movie.Title}
                        loading="lazy"
                      />
                    </div>
                    <div className="list-info">
                      <h3 className="list-title">{movie.Title}</h3>
                      <p className="list-year">Released in {movie.Year}</p>
                      <p className="list-type">{movie.Type?.charAt(0).toUpperCase() + movie.Type?.slice(1) || 'Movie'}</p>
                    </div>
                    <div className="list-actions">
                      <Link to={`/movie/${movie.imdbID}`} className="view-btn">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .favorites-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .favorites-header {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          color: white;
          padding: 3rem 2rem;
          position: relative;
          overflow: hidden;
        }

        .favorites-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="heart" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><text x="10" y="15" text-anchor="middle" font-size="12" fill="rgba(255,255,255,0.1)">♥</text></pattern></defs><rect width="100" height="100" fill="url(%23heart)"/></svg>');
          opacity: 0.1;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .header-text {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .header-icon {
          font-size: 4rem;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
          animation: heartbeat 2s ease-in-out infinite;
        }

        .page-title {
          font-size: 3rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .page-subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
          font-weight: 300;
          margin: 0;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .view-toggle {
          display: flex;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 0.25rem;
          backdrop-filter: blur(10px);
        }

        .toggle-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toggle-btn.active {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          transform: scale(1.05);
        }

        .toggle-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
        }

        .sort-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sort-label {
          font-size: 0.9rem;
          opacity: 0.9;
          font-weight: 500;
        }

        .sort-select {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          cursor: pointer;
          backdrop-filter: blur(10px);
        }

        .sort-select option {
          background: #2c3e50;
          color: white;
        }

        .loading-section {
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
          border-top: 4px solid #ff6b6b;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        .loading-text {
          color: #7f8c8d;
          font-size: 1.1rem;
        }

        .favorites-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem 4rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #7f8c8d;
          background: white;
          border-radius: 20px;
          margin-top: -2rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .empty-illustration {
          position: relative;
          margin-bottom: 2rem;
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-heart {
          font-size: 6rem;
          opacity: 0.3;
          animation: pulse 2s ease-in-out infinite;
        }

        .empty-popcorn {
          font-size: 3rem;
          position: absolute;
          top: 20px;
          right: 40%;
          opacity: 0.4;
          animation: bounce 3s ease-in-out infinite;
        }

        .empty-title {
          font-size: 2rem;
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .empty-description {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        .explore-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          color: white;
          text-decoration: none;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }

        .explore-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
          color: white;
        }

        .stats-bar {
          display: flex;
          justify-content: center;
          gap: 3rem;
          background: white;
          padding: 2rem;
          border-radius: 20px;
          margin: -2rem 0 3rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .stats-item {
          text-align: center;
        }

        .stats-number {
          display: block;
          font-size: 2.5rem;
          font-weight: 800;
          color: #ff6b6b;
          line-height: 1;
        }

        .stats-label {
          font-size: 0.9rem;
          color: #7f8c8d;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .movies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 2rem;
        }

        .grid-item {
          transition: transform 0.3s ease;
        }

        .grid-item:hover {
          transform: translateY(-5px);
        }

        .movies-list {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .list-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #f8f9fa;
          transition: all 0.3s ease;
          position: relative;
        }

        .list-item:hover {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          transform: translateX(5px);
        }

        .list-item:last-child {
          border-bottom: none;
        }

        .list-number {
          font-size: 1.5rem;
          font-weight: 800;
          color: #ff6b6b;
          min-width: 40px;
        }

        .list-poster {
          width: 60px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          flex-shrink: 0;
        }

        .list-poster img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .list-info {
          flex: 1;
        }

        .list-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 0.5rem 0;
        }

        .list-year {
          color: #7f8c8d;
          margin: 0 0 0.25rem 0;
          font-size: 0.9rem;
        }

        .list-type {
          color: #95a5a6;
          margin: 0;
          font-size: 0.8rem;
          text-transform: capitalize;
        }

        .list-actions {
          display: flex;
          gap: 1rem;
        }

        .view-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .view-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          color: white;
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @media (max-width: 968px) {
          .header-content {
            flex-direction: column;
            gap: 2rem;
            text-align: center;
          }

          .header-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .page-title {
            font-size: 2.5rem;
          }

          .stats-bar {
            flex-direction: column;
            gap: 1.5rem;
            margin: -1rem 0 2rem;
          }

          .movies-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .favorites-header {
            padding: 2rem 1rem;
          }

          .header-text {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .header-icon {
            font-size: 3rem;
          }

          .page-title {
            font-size: 2rem;
          }

          .page-subtitle {
            font-size: 1rem;
          }

          .favorites-content {
            padding: 0 1rem 2rem;
          }

          .stats-bar {
            padding: 1.5rem;
            gap: 1rem;
          }

          .stats-number {
            font-size: 2rem;
          }

          .movies-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 1rem;
          }

          .list-item {
            padding: 1rem;
            gap: 1rem;
          }

          .list-number {
            font-size: 1.2rem;
            min-width: 30px;
          }

          .list-poster {
            width: 50px;
            height: 70px;
          }

          .list-title {
            font-size: 1.1rem;
          }

          .list-year, .list-type {
            font-size: 0.8rem;
          }

          .view-btn {
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .header-text {
            gap: 0.5rem;
          }

          .header-icon {
            font-size: 2.5rem;
          }

          .page-title {
            font-size: 1.8rem;
          }

          .empty-state {
            padding: 2rem 1rem;
            margin-top: -1rem;
          }

          .empty-heart {
            font-size: 4rem;
          }

          .empty-popcorn {
            font-size: 2rem;
            right: 35%;
          }

          .empty-title {
            font-size: 1.5rem;
          }

          .movies-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }

          .list-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 1rem 0.75rem;
          }

          .list-item:hover {
            transform: none;
          }

          .list-number {
            position: absolute;
            top: 1rem;
            right: 1rem;
          }

          .list-poster {
            width: 60px;
            height: 80px;
            align-self: flex-start;
          }

          .list-info {
            width: 100%;
          }

          .list-actions {
            width: 100%;
            justify-content: flex-start;
          }

          .view-btn {
            flex: 1;
            text-align: center;
            max-width: 150px;
          }
        }
      `}</style>
    </div>
  );
}









// import React, { useEffect, useState } from "react";
// import { database, auth } from "../firebase/firebase";
// import { ref, onValue } from "firebase/database";
// import MovieList from "../components/MovieList";

// export default function Favorites() {
//   const [movies, setMovies] = useState([]);

//   useEffect(() => {
//     const user = auth.currentUser;
//     if (!user) return;
//     const favRef = ref(database, `favorites/${user.uid}`);
//     onValue(favRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         setMovies(Object.values(data));
//       } else {
//         setMovies([]);
//       }
//     });
//   }, []);

//   return (
//     <div className="container mt-4">
//       <h2 className="text-center mb-4">Your Favorites</h2>
//       <MovieList movies={movies} />
//     </div>
//   );
// }
