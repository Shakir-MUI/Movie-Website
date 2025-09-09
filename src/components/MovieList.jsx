import React from "react";
import MovieCard from "./MovieCard";

export default function MovieList({ movies, showRemoveOption = false, onRemove }) {
  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="alert alert-light">
          <h5>No movies found</h5>
          <p className="text-muted">Try searching with different keywords.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      {movies.map((movie) => (
        <MovieCard 
          key={movie.imdbID} 
          movie={movie} 
          showRemoveOption={showRemoveOption}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}









// import React from "react";
// import MovieCard from "./MovieCard";

// export default function MovieList({ movies }) {
//   if (!movies || movies.length === 0) {
//     return <p className="text-center">No movies found.</p>;
//   }

//   return (
//     <div className="row">
//       {movies.map((movie) => (
//         <MovieCard key={movie.imdbID} movie={movie} />
//       ))}
//     </div>
//   );
// }
