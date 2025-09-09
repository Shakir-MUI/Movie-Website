import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header({ user, onSignOut }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="modern-navbar">
        <div className="nav-container" style={{ height: "100px"}}>
          {/* Logo */}
          <Link className="nav-logo" to="/" onClick={closeMenu}>
            <div className="logo-icon">🎬</div>
            <span className="logo-text">CinemaHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links desktop-only" >
            <Link 
              className={`nav-link ${isActive('/') ? 'active' : ''}`} 
              to="/"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              Home
            </Link>
            <Link 
              className={`nav-link ${isActive('/favorites') ? 'active' : ''}`} 
              to="/favorites"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              Favorites
            </Link>
          </div>

          {/* User Profile & Sign Out */}
          <div className="nav-user desktop-only">
            <div className="user-info">
              <div className="user-avatar">
                {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="user-name">
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </span>
            </div>
            <button className="sign-out-btn" onClick={onSignOut}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn mobile-only"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-content">
            <div className="mobile-user-section">
              <div className="mobile-user-avatar">
                {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="mobile-user-info">
                <span className="mobile-user-name">
                  {user?.displayName || 'User'}
                </span>
                <span className="mobile-user-email">
                  {user?.email}
                </span>
              </div>
            </div>

            <div className="mobile-nav-links">
              <Link 
                className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`} 
                to="/"
                onClick={closeMenu}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
                Home
              </Link>
              <Link 
                className={`mobile-nav-link ${isActive('/favorites') ? 'active' : ''}`} 
                to="/favorites"
                onClick={closeMenu}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                Favorites
              </Link>
            </div>

            <button className="mobile-sign-out-btn" onClick={() => { onSignOut(); closeMenu(); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && <div className="mobile-menu-overlay" onClick={closeMenu}></div>}
      </nav>

      <style jsx>{`
        .modern-navbar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: white;
          font-weight: 700;
          font-size: 1.5rem;
          transition: all 0.3s ease;
        }

        .nav-logo:hover {
          color: #ffd700;
          transform: scale(1.05);
        }

        .logo-icon {
          font-size: 2rem;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .logo-text {
          background: linear-gradient(45deg, #ffd700, #ff6b6b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .nav-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
          z-index: -1;
        }

        .nav-link:hover::before,
        .nav-link.active::before {
          transform: scaleX(1);
        }

        .nav-link:hover,
        .nav-link.active {
          color: white;
          transform: translateY(-2px);
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: white;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6b6b, #ffd700);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .user-name {
          font-weight: 500;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sign-out-btn {
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
        }

        .sign-out-btn:hover {
          background: rgba(255, 107, 107, 0.2);
          border-color: rgba(255, 107, 107, 0.3);
          transform: translateY(-2px);
        }

        .mobile-menu-btn {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }

        .hamburger {
          width: 25px;
          height: 3px;
          background: white;
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .hamburger.open:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
        }

        .hamburger.open:nth-child(2) {
          opacity: 0;
        }

        .hamburger.open:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
        }

        .mobile-menu {
          position: fixed;
          top: 0;
          right: -100%;
          width: 320px;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          backdrop-filter: blur(20px);
          transition: right 0.3s ease;
          z-index: 1001;
          box-shadow: -8px 0 32px rgba(0, 0, 0, 0.2);
        }

        .mobile-menu.open {
          right: 0;
        }

        .mobile-menu-content {
          padding: 6rem 2rem 2rem;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .mobile-user-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 2rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 2rem;
        }

        .mobile-user-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6b6b, #ffd700);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
          font-size: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .mobile-user-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          color: white;
        }

        .mobile-user-name {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .mobile-user-email {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          padding: 1rem 1.5rem;
          border-radius: 15px;
          font-weight: 500;
          transition: all 0.3s ease;
          font-size: 1.1rem;
        }

        .mobile-nav-link:hover,
        .mobile-nav-link.active {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: translateX(10px);
        }

        .mobile-sign-out-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 107, 107, 0.2);
          border: 1px solid rgba(255, 107, 107, 0.3);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.1rem;
          margin-top: auto;
        }

        .mobile-sign-out-btn:hover {
          background: rgba(255, 107, 107, 0.3);
          transform: translateY(-2px);
        }

        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
        }

        .desktop-only {
          display: flex;
        }

        .mobile-only {
          display: none;
        }

        @media (max-width: 968px) {
          .desktop-only {
            display: none;
          }

          .mobile-only {
            display: flex;
          }

          .nav-container {
            padding: 1rem;
          }
        }

        @media (max-width: 480px) {
          .mobile-menu {
            width: 100vw;
            right: -100vw;
          }
        }
      `}</style>
    </>
  );
}









// import React from "react";
// import { Link } from "react-router-dom";

// export default function Header() {
//   return (
//     <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
//       <div className="container">
//         <Link className="navbar-brand" to="/">MovieSite</Link>
//         <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
//           <span className="navbar-toggler-icon"></span>
//         </button>
//         <div className="collapse navbar-collapse" id="navbarNav">
//           <ul className="navbar-nav ms-auto">
//             <li className="nav-item">
//               <Link className="nav-link" to="/">Home</Link>
//             </li>
//             <li className="nav-item">
//               <Link className="nav-link" to="/favorites">Favorites</Link>
//             </li>
//             <li className="nav-item">
//               <button className="btn btn-outline-light ms-2" onClick={onSignOut}>Sign Out</button>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// }
