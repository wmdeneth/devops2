import React, { useEffect, useState } from 'react';
import { Container, Table, Alert, Card, Spinner, Badge } from 'react-bootstrap';
import { Navbar, Footer } from "../components";
import { API_BASE } from "../api";

const MyRentalsPage = ({ user, onLogout }) => {
    const [rentalRequests, setRentalRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) {
            fetch(`${API_BASE}/api/rental-requests/${user.username}`)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch rental requests");
                    return res.json();
                })
                .then(data => {
                    setRentalRequests(data);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [user]);

    const getStatusBadge = (status) => {
        const badges = {
            'pending': { bg: 'warning', text: 'Pending Approval' },
            'accepted': { bg: 'success', text: 'Accepted' },
            'rejected': { bg: 'danger', text: 'Rejected' }
        };
        const badge = badges[status] || { bg: 'secondary', text: status };
        return <Badge bg={badge.bg}>{badge.text}</Badge>;
    };

    if (!user) return <div className="p-5 text-center">Please log in to view rental requests.</div>;

    return (
        <div className="page-root d-flex flex-column min-vh-100">
            <Navbar user={user} onLogout={onLogout} />
            <Container className="py-5 flex-grow-1">
                <h2 className="mb-4">My Rental Requests</h2>
                {error && <Alert variant="danger">{error}</Alert>}

                {loading ? (
                    <div className="text-center"><Spinner animation="border" /></div>
                ) : rentalRequests.length === 0 ? (
                    <Alert variant="info">You haven't made any rental requests yet.</Alert>
                ) : (
                    <Card className="shadow-sm">
                        <Table responsive hover className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th>Vehicle</th>
                                    <th>Dates</th>
                                    <th>Total Price</th>
                                    <th>Status</th>
                                    <th>Requested At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rentalRequests.map((request, idx) => (
                                    <tr key={idx}>
                                        <td className="fw-bold">{request.vehicleTitle}</td>
                                        <td>
                                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="fw-semibold text-success">LKR {request.totalPrice?.toLocaleString()}</td>
                                        <td>{getStatusBadge(request.status)}</td>
                                        <td className="text-muted small">{new Date(request.requestedAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                )}
            </Container>
            <Footer />
        </div>
    );
};

export default MyRentalsPage;
