import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Footer } from "../components";
import { API_BASE } from "../api";
import "./pages.css";

const HomePage = ({ user, onLogout }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Search & Filter
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");

  // Rental Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setLoadError("");

    fetch(`${API_BASE}/api/vehicles`)
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to load vehicles");
        }
        return res.json();
      })
      .then(data => {
        if (!isMounted) return;
        setVehicles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading vehicles:", err);
        if (!isMounted) return;
        setLoadError("Unable to load vehicles. Please check the backend and try again.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAds = useMemo(() => {
    return vehicles
      .filter((a) => a.title.toLowerCase().includes(query.trim().toLowerCase()))
      .filter((a) => category === "All" || a.category === category)
      .sort((a, b) => {
        switch (sort) {
          case "price-asc": return a.price - b.price;
          case "price-desc": return b.price - a.price;
          case "rating": return b.rating - a.rating;
          case "featured":
          default: return (b.featured === true) - (a.featured === true);
        }
      });
  }, [vehicles, query, category, sort]);

  const handleRentClick = (vehicle) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSelectedVehicle(vehicle);
    setStartDate("");
    setEndDate("");
    setModalError("");
    setModalSuccess("");
    setShowModal(true);
  };

  const handleConfirmRent = async () => {
    if (!startDate || !endDate) {
      setModalError("Please select both start and end dates.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include start day

    if (diffDays <= 0) {
      setModalError("End date must be after start date.");
      return;
    }

    const totalPrice = diffDays * selectedVehicle.price;

    try {
      // Convert dates to ISO format (YYYY-MM-DD) for backend
      const formatDateToISO = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      const res = await fetch(`${API_BASE}/api/rental-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          vehicleId: selectedVehicle.id,
          startDate: formatDateToISO(startDate),
          endDate: formatDateToISO(endDate),
          totalPrice
        })
      });

      if (res.ok) {
        setModalSuccess(`Rental request submitted for LKR ${totalPrice}! Waiting for admin approval.`);
        setTimeout(() => {
          setShowModal(false);
          setSelectedVehicle(null);
          navigate("/my-rentals");
        }, 2000);
      } else {
        const data = await res.json();
        setModalError(data.message || "Failed to rent.");
      }
    } catch (err) {
      setModalError("Network error.");
    }
  };

  const featuredAds = vehicles.filter((a) => a.featured);

  // Modern Styles
  const styles = {
    // Hero Section
    heroSection: {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    },
    heroOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
    },
    heroContent: {
      position: 'relative',
      zIndex: 1,
      maxWidth: '1200px',
      width: '100%',
      padding: '0 2rem',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '3rem',
      alignItems: 'center',
    },
    heroLeft: {
      animation: 'fadeInUp 0.8s ease-out',
    },
    heroTitle: {
      fontSize: '4rem',
      fontWeight: '800',
      lineHeight: '1.1',
      marginBottom: '1.5rem',
      background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textShadow: '0 10px 30px rgba(0,0,0,0.1)',
    },
    heroSubtitle: {
      fontSize: '1.25rem',
      color: '#c7d2fe',
      marginBottom: '2rem',
      lineHeight: '1.6',
    },
    ctaButton: {
      backgroundColor: '#667eea',
      border: 'none',
      padding: '12px 32px',
      fontSize: '1rem',
      fontWeight: '600',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      color: '#fff',
      display: 'inline-block',
      textDecoration: 'none',
    },
    heroImage: {
      width: '100%',
      maxWidth: '500px',
      borderRadius: '12px',
      boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
      animation: 'float 3s ease-in-out infinite',
    },

    // Section Container
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem',
    },

    // Section Styles
    section: {
      padding: '5rem 0',
    },
    sectionTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#0a0e27',
      marginBottom: '3rem',
      position: 'relative',
      paddingBottom: '1rem',
    },
    sectionTitleUnderline: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100px',
      height: '4px',
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '2px',
    },

    // Vehicle Grid
    vehicleGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '2rem',
    },
    vehicleCard: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: '1px solid #f0f0f0',
    },
    vehicleCardHover: {
      boxShadow: '0 12px 30px rgba(102, 126, 234, 0.15)',
      transform: 'translateY(-8px)',
    },
    vehicleImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
    },
    vehicleBody: {
      padding: '1.5rem',
    },
    vehicleTitle: {
      fontSize: '1.2rem',
      fontWeight: '700',
      color: '#0a0e27',
      marginBottom: '0.5rem',
    },
    vehicleInfo: {
      fontSize: '0.85rem',
      color: '#888',
      marginBottom: '1rem',
    },
    vehiclePrice: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#667eea',
      marginBottom: '1rem',
    },
    vehicleButton: {
      width: '100%',
      backgroundColor: '#667eea',
      color: '#fff',
      border: 'none',
      padding: '10px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'background-color 0.3s ease',
    },

    // Filter Bar
    filterBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      gap: '1rem',
      flexWrap: 'wrap',
    },
    filterSelect: {
      padding: '10px 15px',
      borderRadius: '6px',
      border: '1px solid #ddd',
      fontSize: '0.95rem',
      cursor: 'pointer',
      backgroundColor: '#fff',
    },

    // Modal Styles
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#0a0e27',
      marginBottom: '1rem',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    formLabel: {
      display: 'block',
      fontWeight: '600',
      color: '#0a0e27',
      marginBottom: '0.5rem',
    },
    formInput: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '6px',
      border: '1px solid #ddd',
      fontSize: '0.95rem',
      boxSizing: 'border-box',
    },
  };

  return (
    <div style={{ backgroundColor: '#f8f9fb' }}>
      <Navbar user={user} onLogout={onLogout} />

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <div style={styles.heroLeft}>
            <h1 style={styles.heroTitle}>Drive Your Dreams Today..</h1>
            <p style={styles.heroSubtitle}>
              Discover thee perfect vehicle for your next adventure. Premium quality cars, unbeatable prices, and exceptional service.
            </p>
            <button
              style={styles.ctaButton}
              onClick={() => document.getElementById('vehicle-section').scrollIntoView({ behavior: 'smooth' })}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#764ba2'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
            >
              Browse Vehicles →
            </button>
          </div>
          <div>
            {featuredAds.length > 0 && (
              <img src={featuredAds[0].img} alt="Featured Car" style={styles.heroImage} />
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ ...styles.section, backgroundColor: '#fff' }}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>
            Why Choose EasyRent?
            <span style={styles.sectionTitleUnderline}></span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {[
              { icon: '🚗', title: 'Wide Selection', desc: 'Choose from hundreds of vehicles for every need' },
              { icon: '💰', title: 'Best Prices', desc: 'Competitive rates with transparent pricing' },
              { icon: '⚡', title: 'Quick Booking', desc: 'Reserve your car in minutes, not hours' },
              { icon: '🛡️', title: 'Safe & Secure', desc: 'Insured vehicles and verified drivers' },
            ].map((feature, idx) => (
              <div key={idx} style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0a0e27', marginBottom: '0.5rem' }}>{feature.title}</h3>
                <p style={{ color: '#666', fontSize: '0.95rem' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicles Section */}
      <section style={styles.section} id="vehicle-section">
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>
            Available Vehicles
            <span style={styles.sectionTitleUnderline}></span>
          </h2>

          <div style={styles.filterBar}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                placeholder="Search vehicles..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ ...styles.filterSelect, width: '100%' }}
              />
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.filterSelect}>
              <option value="All">All Categories</option>
              {[...new Set(vehicles.map(v => v.category))].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={styles.filterSelect}>
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ fontSize: '1.1rem', color: '#666' }}>Loading vehicles...</p>
            </div>
          ) : loadError ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#fff', borderRadius: '12px' }}>
              <p style={{ fontSize: '1.1rem', color: '#b91c1c' }}>{loadError}</p>
            </div>
          ) : filteredAds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#fff', borderRadius: '12px' }}>
              <p style={{ fontSize: '1.1rem', color: '#666' }}>No vehicles match your filters.</p>
            </div>
          ) : (
            <div style={styles.vehicleGrid}>
              {filteredAds.map((vehicle) => (
                <div
                  key={vehicle.id}
                  style={styles.vehicleCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = styles.vehicleCardHover.boxShadow;
                    e.currentTarget.style.transform = styles.vehicleCardHover.transform;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = styles.vehicleCard.boxShadow;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img src={vehicle.img} alt={vehicle.title} style={styles.vehicleImage} />
                    {vehicle.featured && (
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: '#667eea',
                        color: '#fff',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                      }}>
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  <div style={styles.vehicleBody}>
                    <h3 style={styles.vehicleTitle}>{vehicle.title}</h3>
                    <p style={styles.vehicleInfo}>
                      📍 {vehicle.loc} • 👥 {vehicle.seats} seats • ⭐ {vehicle.rating}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={styles.vehiclePrice}>
                        LKR {vehicle.price}<span style={{ fontSize: '0.8rem', color: '#666', fontWeight: '400' }}>/day</span>
                      </span>
                      <button
                        style={styles.vehicleButton}
                        onClick={() => handleRentClick(vehicle)}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#764ba2'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
                      >
                        {user ? 'Reserve' : 'Login'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Rental Modal */}
      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Rent {selectedVehicle?.title}</h2>

            {selectedVehicle && (
              <>
                <img src={selectedVehicle.img} alt={selectedVehicle.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '1.5rem' }} />
                <p style={{ fontSize: '1rem', color: '#0a0e27', marginBottom: '1.5rem' }}>
                  <strong>Price:</strong> <span style={{ color: '#667eea', fontWeight: '700' }}>LKR {selectedVehicle.price} / day</span>
                </p>

                {modalError && (
                  <div style={{ backgroundColor: '#fee', borderRadius: '6px', padding: '1rem', marginBottom: '1rem', color: '#c33' }}>
                    {modalError}
                  </div>
                )}
                {modalSuccess && (
                  <div style={{ backgroundColor: '#efe', borderRadius: '6px', padding: '1rem', marginBottom: '1rem', color: '#3c3' }}>
                    {modalSuccess}
                  </div>
                )}

                {!modalSuccess && (
                  <>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Start Date</label>
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.formInput} />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>End Date</label>
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={styles.formInput} />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                      <button
                        style={{ flex: 1, ...styles.vehicleButton, backgroundColor: '#ddd', color: '#333' }}
                        onClick={() => setShowModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        style={{ flex: 1, ...styles.vehicleButton }}
                        onClick={handleConfirmRent}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#764ba2'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
                      >
                        Confirm Rental
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default HomePage;
