
import React, { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import { auth } from "../firebase/firebase";

const API_KEY = "a92f198";

const categories = [
  { title: "Action Movies", query: "action", icon: "💥", gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)" },
  { title: "Comedy Movies", query: "comedy", icon: "😂", gradient: "linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)" },
  { title: "Adventure Movies", query: "adventure", icon: "🗺️", gradient: "linear-gradient(135deg, #48cae4 0%, #023e8a 100%)" },
  { title: "Movies for Kids", query: "kids", icon: "🎈", gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
  { title: "Thriller Movies", query: "thriller", icon: "🎯", gradient: "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)" },
  { title: "Drama Movies", query: "drama", icon: "🎭", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { title: "Sci-Fi Movies", query: "sci-fi", icon: "🚀", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [categoryMovies, setCategoryMovies] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  const searchMovies = async () => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const url = `https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.Search) {
        setSearchResults(data.Search);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategoryMovies = async () => {
      setLoading(true);
      try {
        const promises = categories.map(async (cat) => {
          const url = `https://www.omdbapi.com/?s=${cat.query}&apikey=${API_KEY}`;
          const res = await fetch(url);
          const data = await res.json();
          return { category: cat.title, movies: data.Search || [] };
        });

        const results = await Promise.all(promises);
        const categoryData = {};
        results.forEach(result => {
          categoryData[result.category] = result.movies;
        });
        setCategoryMovies(categoryData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryMovies();
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchMovies();
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
  };

  const toggleCategory = (title) => {
    setExpandedCategories(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome back, <span className="user-name">{user?.displayName || user?.email?.split('@')[0] || 'Movie Lover'}</span>! 👋
            </h1>
            <p className="hero-subtitle">
              Discover your next favorite movie from thousands of titles
            </p>
          </div>

          <div className="search-section">
            <div className="search-container">
              <div className="search-input-wrapper">
                <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search for movies, actors, directors..."
                  className="search-input"
                />
                {query && (
                  <button className="clear-button" onClick={clearSearch}>✖</button>
                )}
                <button 
                  className="search-button"
                  onClick={searchMovies}
                  disabled={searchLoading}
                >
                  {searchLoading ? (
                    <div className="search-spinner"></div>
                  ) : (
                    'Search'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="floating-icon">🎬</div>
          <div className="floating-icon delay-1">🍿</div>
          <div className="floating-icon delay-2">🎭</div>
          <div className="floating-icon delay-3">📽️</div>
        </div>
      </div>

      <div className="content-container" style={{ marginTop: "40px" }}>
        {/* Search Results */}
        {query && (
          <section className="search-results-section">
            <div className="section-header"> 
              <h2 className="section-title">
                {searchLoading ? 'Searching...' : `Search Results for "${query}"`}
                {searchResults.length > 0 && (
                  <span className="results-count">({searchResults.length} found)</span>
                )}
              </h2>
            </div>
            
            {searchLoading ? (
              <div className="loading-grid">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="loading-card">
                    <div className="loading-poster"></div>
                    <div className="loading-content">
                      <div className="loading-title"></div>
                      <div className="loading-year"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="movies-grid">
                {searchResults.map((movie) => (
                  <MovieCard key={movie.imdbID} movie={movie} />
                ))}
              </div>
            ) : query && (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No movies found</h3>
                <p>Try searching with different keywords</p>
              </div>
            )}
          </section>
        )}

        {/* Category Sections */}
        {loading ? (
          <div className="categories-loading">
            <div className="loading-spinner-large"></div>
            <p>Loading amazing movies for you...</p>
          </div>
        ) : (
          <div className="categories-container">
            {categories.map((cat) => {
              const isExpanded = expandedCategories[cat.title];
              const movies = categoryMovies[cat.title] || [];
              const moviesToShow = isExpanded ? movies : movies.slice(0, 10);

              return (
                <section key={cat.title} className="category-section">
                  <div className="category-header" style={{ background: cat.gradient }}>
                    <div className="category-icon">{cat.icon}</div>
                    <h3 className="category-title">{cat.title}</h3>
                    <div className="category-count">
                      {movies.length} movies
                    </div>
                  </div>
                  
                  <div className="category-content">
                    {movies.length > 0 ? (
                      <>
                        <div className="horizontal-scroll">
                          <div className="movies-row">
                            {moviesToShow.map(movie => (
                              <div key={movie.imdbID} className="movie-item">
                                <MovieCard movie={movie} />
                              </div>
                            ))}
                          </div>
                        </div>
                        {movies.length > 10 && (
                          <button 
                            className="view-all-button"
                            onClick={() => toggleCategory(cat.title)}
                          >
                            {isExpanded ? "Show Less" : "View All"}
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="category-empty">
                        <p>No movies found for this category</p>
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
      
      
       <style jsx>{`
        .home-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4rem 2rem 6rem;
          position: relative;
          overflow: hidden;
        }

        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .hero-text {
          margin-bottom: 3rem;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1rem;
          background: linear-gradient(45deg, #ffd700, #ff6b6b, #4ecdc4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }

        .user-name {
          color: #ffd700;
          text-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
        }

        .hero-subtitle {
          font-size: 1.3rem;
          opacity: 0.9;
          font-weight: 300;
          max-width: 600px;
          margin: 0 auto;
        }

        .search-section {
          max-width: 600px;
          margin: 0 auto;
        }

        .search-container {
          position: relative;
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 60px;
          padding: 0.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .search-input-wrapper:focus-within {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .search-icon {
          color: rgba(255, 255, 255, 0.7);
          margin: 0 1rem;
          flex-shrink: 0;
        }

        .search-input {
          flex: 1;
          background: none;
          border: none;
          color: white;
          font-size: 1.1rem;
          font-weight: 400;
          padding: 1rem 0;
          outline: none;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .search-button {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          border: none;
          color: white;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 100px;
        }

        .search-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
        }

        .search-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .search-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .hero-decoration {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .floating-icon {
          position: absolute;
          font-size: 3rem;
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
        }

        .floating-icon:nth-child(1) { top: 20%; left: 10%; }
        .floating-icon:nth-child(2) { top: 60%; right: 15%; }
        .floating-icon:nth-child(3) { bottom: 30%; left: 20%; }
        .floating-icon:nth-child(4) { top: 40%; right: 25%; }

        .floating-icon.delay-1 { animation-delay: -2s; }
        .floating-icon.delay-2 { animation-delay: -4s; }
        .floating-icon.delay-3 { animation-delay: -1s; }

        .content-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .search-results-section {
          margin: -3rem 0 4rem;
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          margin-bottom: 2rem;
        }

        .section-title {
          color: #2c3e50;
          font-size: 1.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .results-count {
          font-size: 1rem;
          font-weight: 400;
          color: #7f8c8d;
          background: #ecf0f1;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
        }

        .movies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 2rem;
        }

        .loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 2rem;
        }

        .loading-card {
          background: #f8f9fa;
          border-radius: 15px;
          overflow: hidden;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .loading-poster {
          height: 350px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .loading-content {
          padding: 1rem;
        }

        .loading-title {
          height: 20px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          margin-bottom: 0.5rem;
          border-radius: 4px;
        }

        .loading-year {
          height: 16px;
          width: 60%;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .no-results {
          text-align: center;
          padding: 4rem 2rem;
          color: #7f8c8d;
        }

        .no-results-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .categories-loading {
          text-align: center;
          padding: 4rem;
          color: #7f8c8d;
        }

        .loading-spinner-large {
          width: 60px;
          height: 60px;
          border: 4px solid #f0f0f0;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 2rem;
        }

        .categories-container {
          padding: 2rem 0;
        }

        .category-section {
          margin-bottom: 4rem;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .category-section:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
        }

        .category-header {
          padding: 2rem;
          color: white;
          display: flex;
          align-items: center;
          gap: 1rem;
          position: relative;
          overflow: hidden;
        }

        .category-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.1);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .category-section:hover .category-header::before {
          opacity: 1;
        }

        .category-icon {
          font-size: 2.5rem;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
        }

        .category-title {
          font-size: 1.8rem;
          font-weight: 700;
          flex: 1;
          margin: 0;
        }

        .category-count {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 25px;
          font-size: 0.9rem;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }

        .category-content {
          padding: 0;
        }

        .horizontal-scroll {
          overflow-x: auto;
          padding: 2rem;
          scrollbar-width: thin;
          scrollbar-color: #ddd transparent;
        }

        .horizontal-scroll::-webkit-scrollbar {
          height: 6px;
        }

        .horizontal-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .horizontal-scroll::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .horizontal-scroll::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

         .movies-row {
           display: flex;
           gap: 1.5rem;
           min-width: min-content;
         }

         .movie-item {
           flex: 0 0 250px;
           transition: transform 0.3s ease;
         }

         .movie-item:hover {
           transform: scale(1.05);
           z-index: 1;
         }

         .category-empty {
           padding: 3rem;
           text-align: center;
           color: #95a5a6;
           font-style: italic;
         }

         @keyframes gradientShift {
           0%, 100% { background-position: 0% 50%; }
           50% { background-position: 100% 50%; }
         }

         @keyframes float {
           0%, 100% { transform: translateY(0px) rotate(0deg); }
           50% { transform: translateY(-20px) rotate(180deg); }
         }

         @keyframes spin {
           0% { transform: rotate(0deg); }
           100% { transform: rotate(360deg); }
         }

         @keyframes pulse {
           0%, 100% { opacity: 1; }
           50% { opacity: 0.7; }
         }

         @keyframes shimmer {
           0% { background-position: -200% 0; }
           100% { background-position: 200% 0; }
         }

         @media (max-width: 768px) {
           .hero-title {
             font-size: 2rem;
           }

           .hero-subtitle {
             font-size: 1.1rem;
           }

           .search-input-wrapper {
             flex-direction: column;
             gap: 1rem;
             padding: 1rem;
           }

           .search-input {
             text-align: center;
             padding: 0.5rem;
           }

           .search-button {
             width: 100%;
             justify-content: center;
           }

           .content-container {
             padding: 0 1rem;
           }           .movies-grid              grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))             gap: 1rem           }           .category-header              padding: 1.5rem             flex-direction: column             text-align: center             gap: 0.5rem           }           .category-title              font-size: 1.4rem           }           .horizontal-scroll              padding: 1rem           }           .movie-item              flex: 0 0 200px;
           }

           .movies-row {
             gap: 1rem;
          }
         }

         @media (max-width: 480px) {
           .hero-section {
             padding: 2rem 1rem 4rem;
           }

           .hero-title {
             font-size: 1.6rem;
           }

           .search-results-section {
             margin: -2rem 0 2rem;
             padding: 1rem;
             border-radius: 15px;
           }

           .movies-grid {
             grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
           }

           .movie-item {
             flex: 0 0 180px;
           }
         }
       `}</style>

    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import MovieCard from "../components/MovieCard";
// import { auth } from "../firebase/firebase";

// const API_KEY = "a92f198";

// const categories = [
//   { title: "Action Movies", query: "action", icon: "💥", gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)" },
//   { title: "Comedy Movies", query: "comedy", icon: "😂", gradient: "linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)" },
//   { title: "Adventure Movies", query: "adventure", icon: "🗺️", gradient: "linear-gradient(135deg, #48cae4 0%, #023e8a 100%)" },
//   { title: "Movies for Kids", query: "kids", icon: "🎈", gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
//   { title: "Thriller Movies", query: "thriller", icon: "🎯", gradient: "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)" },
//   { title: "Drama Movies", query: "drama", icon: "🎭", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
//   { title: "Sci-Fi Movies", query: "sci-fi", icon: "🚀", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
// ];

// export default function Home() {
//   const [query, setQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [categoryMovies, setCategoryMovies] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     setUser(auth.currentUser);
//   }, []);

//   const searchMovies = async () => {
//     if (!query.trim()) {
//       setSearchResults([]);
//       return;
//     }
    
//     setSearchLoading(true);
//     try {
//       const url = `https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`;
//       const res = await fetch(url);
//       const data = await res.json();
//       if (data.Search) {
//         setSearchResults(data.Search);
//       } else {
//         setSearchResults([]);
//       }
//     } catch (error) {
//       console.error("Search error:", error);
//       setSearchResults([]);
//     } finally {
//       setSearchLoading(false);
//     }
//   };

//   useEffect(() => {
//     const fetchCategoryMovies = async () => {
//       setLoading(true);
//       try {
//         const promises = categories.map(async (cat) => {
//           const url = `https://www.omdbapi.com/?s=${cat.query}&apikey=${API_KEY}`;
//           const res = await fetch(url);
//           const data = await res.json();
//           return { category: cat.title, movies: data.Search || [] };
//         });

//         const results = await Promise.all(promises);
//         const categoryData = {};
//         results.forEach(result => {
//           categoryData[result.category] = result.movies;
//         });
//         setCategoryMovies(categoryData);
//       } catch (error) {
//         console.error("Error fetching categories:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCategoryMovies();
//   }, []);

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       searchMovies();
//     }
//   };

//   return (
//     <div className="home-container">
//       {/* Hero Section */}
//       <div className="hero-section">
//         <div className="hero-content">
//           <div className="hero-text">
//             <h1 className="hero-title">
//               Welcome back, <span className="user-name">{user?.displayName || user?.email?.split('@')[0] || 'Movie Lover'}</span>! 👋
//             </h1>
//             <p className="hero-subtitle">
//               Discover your next favorite movie from thousands of titles
//             </p>
//           </div>
          
//           <div className="search-section">
//             <div className="search-container">
//               <div className="search-input-wrapper">
//                 <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
//                   <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
//                   <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
//                 </svg>
//                 <input
//                   type="text"
//                   value={query}
//                   onChange={(e) => setQuery(e.target.value)}
//                   onKeyPress={handleKeyPress}
//                   placeholder="Search for movies, actors, directors..."
//                   className="search-input"
//                 />
//                 <button 
//                   className="search-button"
//                   onClick={searchMovies}
//                   disabled={searchLoading}
//                 >
//                   {searchLoading ? (
//                     <div className="search-spinner"></div>
//                   ) : (
//                     'Search'
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="hero-decoration">
//           <div className="floating-icon">🎬</div>
//           <div className="floating-icon delay-1">🍿</div>
//           <div className="floating-icon delay-2">🎭</div>
//           <div className="floating-icon delay-3">📽️</div>
//         </div>
//       </div>

//       <div className="content-container">
//         {/* Search Results */}
//         {query && (
//           <section className="search-results-section">
//             <div className="section-header"> 
//               <h2 className="section-title">
//                 {searchLoading ? 'Searching...' : `Search Results for "${query}"`}
//                 {searchResults.length > 0 && (
//                   <span className="results-count">({searchResults.length} found)</span>
//                 )}
//               </h2>
//             </div>
            
//             {searchLoading ? (
//               <div className="loading-grid">
//                 {[...Array(8)].map((_, i) => (
//                   <div key={i} className="loading-card">
//                     <div className="loading-poster"></div>
//                     <div className="loading-content">
//                       <div className="loading-title"></div>
//                       <div className="loading-year"></div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : searchResults.length > 0 ? (
//               <div className="movies-grid">
//                 {searchResults.map((movie) => (
//                   <MovieCard key={movie.imdbID} movie={movie} />
//                 ))}
//               </div>
//             ) : query && (
//               <div className="no-results">
//                 <div className="no-results-icon">🔍</div>
//                 <h3>No movies found</h3>
//                 <p>Try searching with different keywords</p>
//               </div>
//             )}
//           </section>
//         )}

//         {/* Category Sections */}
//         {loading ? (
//           <div className="categories-loading">
//             <div className="loading-spinner-large"></div>
//             <p>Loading amazing movies for you...</p>
//           </div>
//         ) : (
//           <div className="categories-container">
//             {categories.map((cat, index) => (
//               <section key={cat.title} className="category-section">
//                 <div className="category-header" style={{ background: cat.gradient }}>
//                   <div className="category-icon">{cat.icon}</div>
//                   <h3 className="category-title">{cat.title}</h3>
//                   <div className="category-count">
//                     {categoryMovies[cat.title]?.length || 0} movies
//                   </div>
//                 </div>
                
//                 <div className="category-content">
//                   {categoryMovies[cat.title] && categoryMovies[cat.title].length > 0 ? (
//                     <div className="horizontal-scroll">
//                       <div className="movies-row">
//                         {categoryMovies[cat.title].slice(0, 10).map(movie => (
//                           <div key={movie.imdbID} className="movie-item">
//                             <MovieCard movie={movie} />
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="category-empty">
//                       <p>No movies found for this category</p>
//                     </div>
//                   )}
//                 </div>
//               </section>
//             ))}
//           </div>
//         )}
//       </div>

//       <style jsx>{`
//         .home-container {
//           min-height: 100vh;
//           background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
//         }

//         .hero-section {
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           color: white;
//           padding: 4rem 2rem 6rem;
//           position: relative;
//           overflow: hidden;
//         }

//         .hero-content {
//           max-width: 1200px;
//           margin: 0 auto;
//           text-align: center;
//           position: relative;
//           z-index: 2;
//         }

//         .hero-text {
//           margin-bottom: 3rem;
//         }

//         .hero-title {
//           font-size: 3rem;
//           font-weight: 800;
//           margin-bottom: 1rem;
//           background: linear-gradient(45deg, #ffd700, #ff6b6b, #4ecdc4);
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//           background-clip: text;
//           background-size: 200% 200%;
//           animation: gradientShift 3s ease infinite;
//         }

//         .user-name {
//           color: #ffd700;
//           text-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
//         }

//         .hero-subtitle {
//           font-size: 1.3rem;
//           opacity: 0.9;
//           font-weight: 300;
//           max-width: 600px;
//           margin: 0 auto;
//         }

//         .search-section {
//           max-width: 600px;
//           margin: 0 auto;
//         }

//         .search-container {
//           position: relative;
//         }

//         .search-input-wrapper {
//           display: flex;
//           align-items: center;
//           background: rgba(255, 255, 255, 0.15);
//           backdrop-filter: blur(20px);
//           border: 1px solid rgba(255, 255, 255, 0.2);
//           border-radius: 60px;
//           padding: 0.5rem;
//           box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
//           transition: all 0.3s ease;
//         }

//         .search-input-wrapper:focus-within {
//           background: rgba(255, 255, 255, 0.25);
//           border-color: rgba(255, 255, 255, 0.4);
//           box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
//           transform: translateY(-2px);
//         }

//         .search-icon {
//           color: rgba(255, 255, 255, 0.7);
//           margin: 0 1rem;
//           flex-shrink: 0;
//         }

//         .search-input {
//           flex: 1;
//           background: none;
//           border: none;
//           color: white;
//           font-size: 1.1rem;
//           font-weight: 400;
//           padding: 1rem 0;
//           outline: none;
//         }

//         .search-input::placeholder {
//           color: rgba(255, 255, 255, 0.7);
//         }

//         .search-button {
//           background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
//           border: none;
//           color: white;
//           padding: 1rem 2rem;
//           border-radius: 50px;
//           font-weight: 600;
//           cursor: pointer;
//           transition: all 0.3s ease;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           min-width: 100px;
//         }

//         .search-button:hover:not(:disabled) {
//           transform: translateY(-2px);
//           box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
//         }

//         .search-button:disabled {
//           opacity: 0.7;
//           cursor: not-allowed;
//         }

//         .search-spinner {
//           width: 20px;
//           height: 20px;
//           border: 2px solid rgba(255, 255, 255, 0.3);
//           border-top: 2px solid white;
//           border-radius: 50%;
//           animation: spin 1s linear infinite;
//         }

//         .hero-decoration {
//           position: absolute;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           pointer-events: none;
//           overflow: hidden;
//         }

//         .floating-icon {
//           position: absolute;
//           font-size: 3rem;
//           opacity: 0.1;
//           animation: float 6s ease-in-out infinite;
//         }

//         .floating-icon:nth-child(1) { top: 20%; left: 10%; }
//         .floating-icon:nth-child(2) { top: 60%; right: 15%; }
//         .floating-icon:nth-child(3) { bottom: 30%; left: 20%; }
//         .floating-icon:nth-child(4) { top: 40%; right: 25%; }

//         .floating-icon.delay-1 { animation-delay: -2s; }
//         .floating-icon.delay-2 { animation-delay: -4s; }
//         .floating-icon.delay-3 { animation-delay: -1s; }

//         .content-container {
//           max-width: 1200px;
//           margin: 0 auto;
//           padding: 0 2rem;
//         }

//         .search-results-section {
//           margin: -3rem 0 4rem;
//           background: white;
//           border-radius: 20px;
//           padding: 2rem;
//           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
//         }

//         .section-header {
//           margin-bottom: 2rem;
//         }

//         .section-title {
//           color: #2c3e50;
//           font-size: 1.8rem;
//           font-weight: 700;
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//         }

//         .results-count {
//           font-size: 1rem;
//           font-weight: 400;
//           color: #7f8c8d;
//           background: #ecf0f1;
//           padding: 0.25rem 0.75rem;
//           border-radius: 20px;
//         }

//         .movies-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
//           gap: 2rem;
//         }

//         .loading-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
//           gap: 2rem;
//         }

//         .loading-card {
//           background: #f8f9fa;
//           border-radius: 15px;
//           overflow: hidden;
//           animation: pulse 1.5s ease-in-out infinite;
//         }

//         .loading-poster {
//           height: 350px;
//           background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
//           background-size: 200% 100%;
//           animation: shimmer 1.5s infinite;
//         }

//         .loading-content {
//           padding: 1rem;
//         }

//         .loading-title {
//           height: 20px;
//           background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
//           background-size: 200% 100%;
//           animation: shimmer 1.5s infinite;
//           margin-bottom: 0.5rem;
//           border-radius: 4px;
//         }

//         .loading-year {
//           height: 16px;
//           width: 60%;
//           background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
//           background-size: 200% 100%;
//           animation: shimmer 1.5s infinite;
//           border-radius: 4px;
//         }

//         .no-results {
//           text-align: center;
//           padding: 4rem 2rem;
//           color: #7f8c8d;
//         }

//         .no-results-icon {
//           font-size: 4rem;
//           margin-bottom: 1rem;
//           opacity: 0.5;
//         }

//         .categories-loading {
//           text-align: center;
//           padding: 4rem;
//           color: #7f8c8d;
//         }

//         .loading-spinner-large {
//           width: 60px;
//           height: 60px;
//           border: 4px solid #f0f0f0;
//           border-top: 4px solid #667eea;
//           border-radius: 50%;
//           animation: spin 1s linear infinite;
//           margin: 0 auto 2rem;
//         }

//         .categories-container {
//           padding: 2rem 0;
//         }

//         .category-section {
//           margin-bottom: 4rem;
//           background: white;
//           border-radius: 20px;
//           overflow: hidden;
//           box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
//           transition: all 0.3s ease;
//         }

//         .category-section:hover {
//           transform: translateY(-5px);
//           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
//         }

//         .category-header {
//           padding: 2rem;
//           color: white;
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//           position: relative;
//           overflow: hidden;
//         }

//         .category-header::before {
//           content: '';
//           position: absolute;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background: rgba(255, 255, 255, 0.1);
//           opacity: 0;
//           transition: opacity 0.3s ease;
//         }

//         .category-section:hover .category-header::before {
//           opacity: 1;
//         }

//         .category-icon {
//           font-size: 2.5rem;
//           filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
//         }

//         .category-title {
//           font-size: 1.8rem;
//           font-weight: 700;
//           flex: 1;
//           margin: 0;
//         }

//         .category-count {
//           background: rgba(255, 255, 255, 0.2);
//           padding: 0.5rem 1rem;
//           border-radius: 25px;
//           font-size: 0.9rem;
//           font-weight: 500;
//           backdrop-filter: blur(10px);
//         }

//         .category-content {
//           padding: 0;
//         }

//         .horizontal-scroll {
//           overflow-x: auto;
//           padding: 2rem;
//           scrollbar-width: thin;
//           scrollbar-color: #ddd transparent;
//         }

//         .horizontal-scroll::-webkit-scrollbar {
//           height: 6px;
//         }

//         .horizontal-scroll::-webkit-scrollbar-track {
//           background: #f1f1f1;
//           border-radius: 3px;
//         }

//         .horizontal-scroll::-webkit-scrollbar-thumb {
//           background: #c1c1c1;
//           border-radius: 3px;
//         }

//         .horizontal-scroll::-webkit-scrollbar-thumb:hover {
//           background: #a8a8a8;
//         }

//         .movies-row {
//           display: flex;
//           gap: 1.5rem;
//           min-width: min-content;
//         }

//         .movie-item {
//           flex: 0 0 250px;
//           transition: transform 0.3s ease;
//         }

//         .movie-item:hover {
//           transform: scale(1.05);
//           z-index: 1;
//         }

//         .category-empty {
//           padding: 3rem;
//           text-align: center;
//           color: #95a5a6;
//           font-style: italic;
//         }

//         @keyframes gradientShift {
//           0%, 100% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//         }

//         @keyframes float {
//           0%, 100% { transform: translateY(0px) rotate(0deg); }
//           50% { transform: translateY(-20px) rotate(180deg); }
//         }

//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }

//         @keyframes pulse {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0.7; }
//         }

//         @keyframes shimmer {
//           0% { background-position: -200% 0; }
//           100% { background-position: 200% 0; }
//         }

//         @media (max-width: 768px) {
//           .hero-title {
//             font-size: 2rem;
//           }

//           .hero-subtitle {
//             font-size: 1.1rem;
//           }

//           .search-input-wrapper {
//             flex-direction: column;
//             gap: 1rem;
//             padding: 1rem;
//           }

//           .search-input {
//             text-align: center;
//             padding: 0.5rem;
//           }

//           .search-button {
//             width: 100%;
//             justify-content: center;
//           }

//           .content-container {
//             padding: 0 1rem;
//           }

//           .movies-grid {
//             grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
//             gap: 1rem;
//           }

//           .category-header {
//             padding: 1.5rem;
//             flex-direction: column;
//             text-align: center;
//             gap: 0.5rem;
//           }

//           .category-title {
//             font-size: 1.4rem;
//           }

//           .horizontal-scroll {
//             padding: 1rem;
//           }

//           .movie-item {
//             flex: 0 0 200px;
//           }

//           .movies-row {
//             gap: 1rem;
//           }
//         }

//         @media (max-width: 480px) {
//           .hero-section {
//             padding: 2rem 1rem 4rem;
//           }

//           .hero-title {
//             font-size: 1.6rem;
//           }

//           .search-results-section {
//             margin: -2rem 0 2rem;
//             padding: 1rem;
//             border-radius: 15px;
//           }

//           .movies-grid {
//             grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
//           }

//           .movie-item {
//             flex: 0 0 180px;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }










// import React, { useState } from "react";
// import MovieList from "../components/MovieList";
// import SearchBar from "../components/SearchBar";

// const API_KEY = "a92f198"; // OMDB API Key

// export default function Home() {
//   const [query, setQuery] = useState("");
//   const [movies, setMovies] = useState([]);

//   const searchMovies = async () => {
//     if (!query.trim()) return;
//     const url = `https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`;
//     const res = await fetch(url);
//     const data = await res.json();
//     if (data.Search) {
//       setMovies(data.Search);
//     } else {
//       setMovies([]);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     searchMovies();
//   };

//   return (
//     <div className="container mt-4">
//       <h2 className="text-center mb-4">Search for Movies</h2>
//       <form onSubmit={handleSubmit} className="d-flex mb-4 justify-content-center">
//         <input
//           type="text"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Enter movie name..."
//           className="form-control w-50 me-2"
//         />
//         <button type="submit" className="btn btn-primary">Search</button>
//       </form>
//       <MovieList movies={movies} />
//     </div>
//   );
// }
