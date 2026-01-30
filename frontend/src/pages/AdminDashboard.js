import React, { useState, useEffect } from "react";
import { Navbar, Footer } from "../components";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "../api";
import {
    FiPlus, FiTrash2, FiTrendingUp, FiPackage,
    FiUsers, FiDollarSign, FiCheckCircle, FiAlertCircle
} from "react-icons/fi";
import "./pages.css";

const AdminDashboard = ({ user, onLogout }) => {
    const [vehicles, setVehicles] = useState([]);
    const [rentals, setRentals] = useState([]);
    const [rentalRequests, setRentalRequests] = useState([]);
    const [activeTab, setActiveTab] = useState("requests");
    const [loading, setLoading] = useState(true);

    // Form State
    const [newVehicle, setNewVehicle] = useState({
        title: "",
        price: "",
        seats: "",
        loc: "",
        category: "Compact",
        img: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate("/");
        }
    }, [user, navigate]);

    useEffect(() => {
        fetchVehicles();
        fetchRentals();
        fetchRentalRequests();
    }, [user]);

    const fetchVehicles = () => {
        fetch(`${API_BASE}/api/vehicles`)
            .then(res => res.json())
            .then(data => {
                setVehicles(data);
                setLoading(false);
            })
            .catch(err => console.error("Error loading vehicles:", err));
    };

    const fetchRentals = () => {
        if (user && user.role === 'admin') {
            fetch(`${API_BASE}/api/admin/rentals`, {
                headers: { "username": user.username }
            })
                .then(res => res.json())
                .then(data => setRentals(data))
                .catch(err => console.error("Error loading rentals:", err));
        }
    };

    const fetchRentalRequests = () => {
        if (user && user.role === 'admin') {
            fetch(`${API_BASE}/api/admin/rental-requests`, {
                headers: { "username": user.username }
            })
                .then(res => res.json())
                .then(data => setRentalRequests(data))
                .catch(err => console.error("Error loading rental requests:", err));
        }
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!newVehicle.title || !newVehicle.price || !newVehicle.img) {
            setError("Please fill in all required fields.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/vehicles`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "username": user.username
                },
                body: JSON.stringify({
                    ...newVehicle,
                    price: parseInt(newVehicle.price),
                    seats: parseInt(newVehicle.seats || 4)
                })
            });

            if (res.ok) {
                setSuccess("Vehicle added successfully!");
                setNewVehicle({ title: "", price: "", seats: "", loc: "", category: "Compact", img: "" });
                fetchVehicles();
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError("Failed to add vehicle.");
            }
        } catch (err) {
            setError("Network error.");
        }
    };

    const handleDeleteVehicle = async (id) => {
        if (!window.confirm("Are you sure you want to delete this vehicle?")) return;

        try {
            const res = await fetch(`${API_BASE}/api/vehicles/${id}`, {
                method: "DELETE",
                headers: { "username": user.username }
            });

            if (res.ok) {
                fetchVehicles();
            } else {
                alert("Failed to delete vehicle");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            const res = await fetch(
                `${API_BASE}/api/admin/rental-requests/${requestId}/accept`,
                {
                    method: "PUT",
                    headers: { "username": user.username }
                }
            );

            if (res.ok) {
                setSuccess("Rental request accepted! Rental created.");
                fetchRentalRequests();
                fetchRentals();
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError("Failed to accept request.");
            }
        } catch (err) {
            setError("Network error.");
        }
    };

    const handleRejectRequest = async () => {
        if (!rejectionReason.trim()) {
            setError("Please provide a reason for rejection.");
            return;
        }

        try {
            const res = await fetch(
                `${API_BASE}/api/admin/rental-requests/${selectedRequestId}/reject`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "username": user.username
                    },
                    body: JSON.stringify({ reason: rejectionReason })
                }
            );

            if (res.ok) {
                setSuccess("Rental request rejected.");
                setShowRejectModal(false);
                setRejectionReason("");
                setSelectedRequestId(null);
                fetchRentalRequests();
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError("Failed to reject request.");
            }
        } catch (err) {
            setError("Network error.");
        }
    };

    // Statistics
    const stats = [
        { label: "Total Vehicles", value: vehicles.length, icon: FiPackage, color: "#6366f1" },
        { label: "Total Rentals", value: rentals.length, icon: FiTrendingUp, color: "#10b981" },
        { label: "Revenue (LKR)", value: rentals.reduce((sum, r) => sum + (r.totalPrice || 0), 0), icon: FiDollarSign, color: "#f59e0b" },
        { label: "Active Users", value: new Set(rentals.map(r => r.username)).size, icon: FiUsers, color: "#8b5cf6" },
    ];

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <Navbar user={user} onLogout={onLogout} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={styles.container}
            >
                {/* Header */}
                <div style={styles.header}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 style={styles.title}>Admin Dashboard</h1>
                        <p style={styles.subtitle}>Manage your fleet and analytics</p>
                    </motion.div>
                </div>

                {/* Stats Grid */}
                <div style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                            style={{ ...styles.statCard, borderLeft: `4px solid ${stat.color}` }}
                        >
                            <div style={styles.statIcon} className="stat-icon">
                                <stat.icon size={24} color={stat.color} />
                            </div>
                            <div>
                                <p style={styles.statLabel}>{stat.label}</p>
                                <h3 style={styles.statValue}>{stat.value.toLocaleString()}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    style={styles.tabs}
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={activeTab === 'requests' ? styles.activeTab : styles.tab}
                        onClick={() => setActiveTab('requests')}
                    >
                        <FiAlertCircle style={{ marginRight: 8 }} />
                        Rental Requests ({rentalRequests.length})
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={activeTab === 'vehicles' ? styles.activeTab : styles.tab}
                        onClick={() => setActiveTab('vehicles')}
                    >
                        <FiPackage style={{ marginRight: 8 }} />
                        Manage Vehicles
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={activeTab === 'rentals' ? styles.activeTab : styles.tab}
                        onClick={() => setActiveTab('rentals')}
                    >
                        <FiTrendingUp style={{ marginRight: 8 }} />
                        View Rentals
                    </motion.button>
                </motion.div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'requests' && (
                        <motion.div
                            key="requests"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            style={styles.tabContent}
                        >
                            <h2 style={styles.sectionTitle}>Pending Rental Requests</h2>
                            
                            {error && (
                                <div style={{ ...styles.alert, backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                                    <FiAlertCircle style={{ marginRight: 8 }} />
                                    {error}
                                </div>
                            )}
                            
                            {success && (
                                <div style={{ ...styles.alert, backgroundColor: '#dcfce7', color: '#166534' }}>
                                    <FiCheckCircle style={{ marginRight: 8 }} />
                                    {success}
                                </div>
                            )}
                            
                            {rentalRequests.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <FiPackage size={40} style={{ marginBottom: 16, opacity: 0.5 }} />
                                    <p>No pending rental requests</p>
                                </div>
                            ) : (
                                <div style={styles.requestsGrid}>
                                    {rentalRequests.map((request) => (
                                        <motion.div
                                            key={request.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            whileHover={{ y: -5 }}
                                            style={styles.requestCard}
                                        >
                                            <div style={styles.requestHeader}>
                                                <div>
                                                    <h3 style={styles.requestTitle}>{request.vehicleTitle}</h3>
                                                    <p style={styles.requestUser}>User: {request.username}</p>
                                                </div>
                                                <span style={styles.badge}>PENDING</span>
                                            </div>
                                            
                                            <div style={styles.requestDetails}>
                                                <div style={styles.detailRow}>
                                                    <span style={styles.label}>Category:</span>
                                                    <span>{request.vehicleCategory}</span>
                                                </div>
                                                <div style={styles.detailRow}>
                                                    <span style={styles.label}>Start Date:</span>
                                                    <span>{new Date(request.startDate).toLocaleDateString()}</span>
                                                </div>
                                                <div style={styles.detailRow}>
                                                    <span style={styles.label}>End Date:</span>
                                                    <span>{new Date(request.endDate).toLocaleDateString()}</span>
                                                </div>
                                                <div style={styles.detailRow}>
                                                    <span style={styles.label}>Total Price:</span>
                                                    <span style={styles.priceValue}>LKR {request.totalPrice.toLocaleString()}</span>
                                                </div>
                                                <div style={styles.detailRow}>
                                                    <span style={styles.label}>Requested:</span>
                                                    <span>{new Date(request.requestedAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            
                                            <div style={styles.requestActions}>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    style={{ ...styles.actionBtn, ...styles.acceptBtn }}
                                                    onClick={() => handleAcceptRequest(request.id)}
                                                >
                                                    <FiCheckCircle style={{ marginRight: 6 }} />
                                                    Accept
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    style={{ ...styles.actionBtn, ...styles.rejectBtn }}
                                                    onClick={() => {
                                                        setSelectedRequestId(request.id);
                                                        setShowRejectModal(true);
                                                    }}
                                                >
                                                    <FiAlertCircle style={{ marginRight: 6 }} />
                                                    Reject
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Rejection Modal */}
                            {showRejectModal && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={styles.modal}
                                    onClick={() => setShowRejectModal(false)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                        style={styles.modalContent}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <h3 style={{ marginTop: 0 }}>Reject Rental Request</h3>
                                        <p style={{ color: '#666', marginBottom: 16 }}>
                                            Please provide a reason for rejecting this request.
                                        </p>
                                        <textarea
                                            style={styles.rejectionInput}
                                            placeholder="Enter rejection reason..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                        />
                                        <div style={styles.modalActions}>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                style={{ ...styles.actionBtn, ...styles.cancelBtn }}
                                                onClick={() => {
                                                    setShowRejectModal(false);
                                                    setRejectionReason("");
                                                }}
                                            >
                                                Cancel
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                style={{ ...styles.actionBtn, ...styles.rejectBtn }}
                                                onClick={handleRejectRequest}
                                            >
                                                Confirm Rejection
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                    {activeTab === 'vehicles' && (
                        <motion.div
                            key="vehicles"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            style={styles.content}
                        >
                            {/* Add Vehicle Form */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={styles.card}
                            >
                                <h2 style={styles.cardTitle}>
                                    <FiPlus style={{ marginRight: 8 }} />
                                    Add New Vehicle
                                </h2>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            style={styles.error}
                                        >
                                            <FiAlertCircle style={{ marginRight: 8 }} />
                                            {error}
                                        </motion.div>
                                    )}
                                    {success && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            style={styles.success}
                                        >
                                            <FiCheckCircle style={{ marginRight: 8 }} />
                                            {success}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <form onSubmit={handleAddVehicle} style={styles.form}>
                                    <div style={styles.grid}>
                                        <input
                                            style={styles.input}
                                            type="text"
                                            placeholder="Vehicle Title"
                                            value={newVehicle.title}
                                            onChange={e => setNewVehicle({ ...newVehicle, title: e.target.value })}
                                        />
                                        <input
                                            style={styles.input}
                                            type="number"
                                            placeholder="Price (LKR)"
                                            value={newVehicle.price}
                                            onChange={e => setNewVehicle({ ...newVehicle, price: e.target.value })}
                                        />
                                        <input
                                            style={styles.input}
                                            type="number"
                                            placeholder="Seats"
                                            value={newVehicle.seats}
                                            onChange={e => setNewVehicle({ ...newVehicle, seats: e.target.value })}
                                        />
                                        <input
                                            style={styles.input}
                                            type="text"
                                            placeholder="Location"
                                            value={newVehicle.loc}
                                            onChange={e => setNewVehicle({ ...newVehicle, loc: e.target.value })}
                                        />
                                        <select
                                            style={styles.input}
                                            value={newVehicle.category}
                                            onChange={e => setNewVehicle({ ...newVehicle, category: e.target.value })}
                                        >
                                            <option value="Compact">Compact</option>
                                            <option value="SUV">SUV</option>
                                            <option value="Luxury">Luxury</option>
                                            <option value="Van">Van</option>
                                            <option value="Electric">Electric</option>
                                        </select>
                                        <input
                                            style={styles.input}
                                            type="text"
                                            placeholder="Image URL"
                                            value={newVehicle.img}
                                            onChange={e => setNewVehicle({ ...newVehicle, img: e.target.value })}
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        style={styles.button}
                                    >
                                        <FiPlus style={{ marginRight: 8 }} />
                                        Add Vehicle
                                    </motion.button>
                                </form>
                            </motion.div>

                            {/* Vehicle List */}
                            <div style={styles.gridList}>
                                {vehicles.map((v, index) => (
                                    <motion.div
                                        key={v.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
                                        style={styles.vehicleItem}
                                    >
                                        <img src={v.img} alt={v.title} style={styles.vehicleImg} />
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: 0, fontWeight: 700 }}>{v.title}</h4>
                                            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
                                                LKR {v.price}/day • {v.category}
                                            </p>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleDeleteVehicle(v.id)}
                                            style={styles.deleteBtn}
                                        >
                                            <FiTrash2 />
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'rentals' && (
                        <motion.div
                            key="rentals"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            style={styles.activeRentals}
                        >
                            <h2 style={styles.cardTitle}>
                                <FiTrendingUp style={{ marginRight: 8 }} />
                                All Rentals
                            </h2>
                            {rentals.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>
                                    No rentals found.
                                </p>
                            ) : (
                                <div style={styles.tableContainer}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr style={styles.tableHeader}>
                                                <th style={styles.th}>Vehicle</th>
                                                <th style={styles.th}>User</th>
                                                <th style={styles.th}>Dates</th>
                                                <th style={styles.th}>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rentals.map((r, i) => (
                                                <motion.tr
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    whileHover={{ backgroundColor: '#f8fafc' }}
                                                    style={styles.tableRow}
                                                >
                                                    <td style={styles.td}>{r.vehicleTitle}</td>
                                                    <td style={styles.td}>{r.username}</td>
                                                    <td style={styles.td}>{r.startDate} to {r.endDate}</td>
                                                    <td style={styles.td}>
                                                        <span style={styles.priceBadge}>LKR {r.totalPrice}</span>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <Footer />
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        minHeight: '80vh',
    },
    header: {
        marginBottom: '2rem',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: '0.5rem',
    },
    subtitle: {
        color: '#64748b',
        fontSize: '1.1rem',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
    },
    statCard: {
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'all 0.3s ease',
    },
    statIcon: {
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
        padding: '1rem',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        margin: 0,
        color: '#64748b',
        fontSize: '0.875rem',
        fontWeight: '500',
    },
    statValue: {
        margin: '4px 0 0',
        fontSize: '1.75rem',
        fontWeight: '800',
        color: '#0f172a',
    },
    tabs: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
    },
    tab: {
        background: 'transparent',
        border: 'none',
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        cursor: 'pointer',
        color: '#64748b',
        fontWeight: '600',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.2s',
    },
    activeTab: {
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        border: 'none',
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        cursor: 'pointer',
        color: '#fff',
        fontWeight: '600',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.2s',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    card: {
        background: '#fff',
        padding: '2rem',
        borderRadius: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    },
    cardTitle: {
        marginBottom: '1.5rem',
        color: '#1e293b',
        fontSize: '1.5rem',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
    },
    input: {
        padding: '0.875rem 1rem',
        borderRadius: '12px',
        border: '2px solid #e2e8f0',
        fontSize: '1rem',
        transition: 'all 0.2s',
        outline: 'none',
    },
    button: {
        alignSelf: 'flex-start',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: '#fff',
        border: 'none',
        padding: '0.875rem 2rem',
        borderRadius: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '1rem',
        display: 'flex',
        alignItems: 'center',
        fontSize: '1rem',
        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
    },
    error: {
        color: '#ef4444',
        background: '#fee2e2',
        padding: '1rem',
        borderRadius: '12px',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        fontWeight: '500',
    },
    success: {
        color: '#10b981',
        background: '#d1fae5',
        padding: '1rem',
        borderRadius: '12px',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        fontWeight: '500',
    },
    gridList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem',
    },
    vehicleItem: {
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
    },
    vehicleImg: {
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        borderRadius: '12px',
    },
    deleteBtn: {
        background: '#fee2e2',
        color: '#991b1b',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
    },
    activeRentals: {
        background: '#fff',
        padding: '2rem',
        borderRadius: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    },
    tableContainer: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeader: {
        textAlign: 'left',
        borderBottom: '2px solid #e2e8f0',
    },
    th: {
        padding: '1rem',
        fontWeight: '700',
        color: '#1e293b',
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    tableRow: {
        borderBottom: '1px solid #f1f5f9',
        transition: 'background-color 0.2s',
    },
    td: {
        padding: '1rem',
        color: '#475569',
    },
    priceBadge: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#fff',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '0.875rem',
    },
    requestsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem',
    },
    requestCard: {
        background: '#fff',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        transition: 'all 0.3s ease',
    },
    requestHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #f1f5f9',
    },
    requestTitle: {
        margin: '0 0 0.5rem 0',
        fontSize: '1.125rem',
        fontWeight: '700',
        color: '#0f172a',
    },
    requestUser: {
        margin: 0,
        fontSize: '0.875rem',
        color: '#64748b',
    },
    badge: {
        background: '#fef3c7',
        color: '#92400e',
        padding: '0.375rem 0.75rem',
        borderRadius: '8px',
        fontSize: '0.75rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    requestDetails: {
        marginBottom: '1rem',
    },
    detailRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.5rem 0',
        fontSize: '0.875rem',
    },
    label: {
        fontWeight: '600',
        color: '#64748b',
    },
    priceValue: {
        fontWeight: '700',
        color: '#059669',
    },
    requestActions: {
        display: 'flex',
        gap: '1rem',
        marginTop: '1rem',
    },
    actionBtn: {
        flex: 1,
        padding: '0.75rem 1rem',
        border: 'none',
        borderRadius: '10px',
        fontSize: '0.875rem',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        fontSize: '0.875rem',
    },
    acceptBtn: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#fff',
        boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
    },
    rejectBtn: {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: '#fff',
        boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)',
    },
    cancelBtn: {
        background: '#e2e8f0',
        color: '#475569',
    },
    alert: {
        padding: '1rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        fontWeight: '600',
    },
    emptyState: {
        background: '#fff',
        padding: '3rem 2rem',
        borderRadius: '16px',
        textAlign: 'center',
        color: '#94a3b8',
    },
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalContent: {
        background: '#fff',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
    rejectionInput: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        fontSize: '0.875rem',
        fontFamily: 'inherit',
        resize: 'vertical',
        minHeight: '100px',
        marginBottom: '1rem',
        boxSizing: 'border-box',
    },
    modalActions: {
        display: 'flex',
        gap: '1rem',
    },
};

export default AdminDashboard;
