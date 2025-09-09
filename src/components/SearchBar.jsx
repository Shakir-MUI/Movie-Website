import React from "react";

export default function SearchBar({ query, setQuery, onSearch }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex mb-4 justify-content-center">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter movie name..."
        className="form-control w-50 me-2"
      />
      <button type="submit" className="btn btn-primary">Search</button>
    </form>
  );
}
