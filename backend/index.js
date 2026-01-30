require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bcrypt = require('bcrypt');
const supabase = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Test database connection
async function testConnection() {
  try {
    const { data, error } = await supabase.from('vehicles').select('count');
    if (error) throw error;
    console.log('✅ Connected to Supabase database successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

// Test route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Backend with Supabase!" });
});

// User registration route
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', username)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: username,
        password: hashedPassword,
        name: username,
        role: 'user'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "User created successfully",
      username: data.email
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (username === "admin" && password === "1234") {
      return res.json({
        message: "Login successful",
        username: "admin",
        role: "admin"
      });
    }

    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', username)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      username: user.email,
      role: user.role || 'user'
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all vehicles
app.get("/api/vehicles", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    // Map to match frontend expectations
    const vehicles = data.map(v => ({
      id: v.id,
      title: v.title,
      price: v.price,
      seats: v.seats,
      loc: v.location,
      featured: v.featured,
      category: v.category,
      rating: parseFloat(v.rating),
      img: v.image_url
    }));

    res.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ message: "Error fetching vehicles" });
  }
});

// Create rental request (User action)
app.post("/api/rental-requests", async (req, res) => {
  try {
    const { username, vehicleId, startDate, endDate, totalPrice } = req.body;

    if (!username || !vehicleId || !startDate || !endDate || !totalPrice) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Get user ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', username)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if vehicle exists
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', parseInt(vehicleId))
      .single();

    if (vehicleError || !vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Create rental request
    const { data, error } = await supabase
      .from('rental_requests')
      .insert([{
        user_id: user.id,
        vehicle_id: parseInt(vehicleId),
        start_date: startDate,
        end_date: endDate,
        total_price: totalPrice,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ 
      message: "Rental request submitted successfully. Waiting for admin approval.",
      request: {
        id: data.id,
        status: data.status,
        requestedAt: data.requested_at
      }
    });
  } catch (error) {
    console.error("Rental request error:", error);
    res.status(500).json({ message: "Error submitting rental request" });
  }
});

// Get user's rental requests (User can see their own requests)
app.get("/api/rental-requests/:username", async (req, res) => {
  try {
    // Get user ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', req.params.username)
      .single();

    if (userError || !user) {
      return res.json([]);
    }

    // Get rental requests with vehicle details
    const { data, error } = await supabase
      .from('rental_requests')
      .select(`
        *,
        vehicles (
          id,
          title,
          price,
          image_url
        )
      `)
      .eq('user_id', user.id)
      .order('requested_at', { ascending: false });

    if (error) throw error;

    // Map to match frontend expectations
    const requests = data.map(r => ({
      id: r.id,
      username: req.params.username,
      vehicleId: r.vehicle_id,
      vehicleTitle: r.vehicles.title,
      startDate: r.start_date,
      endDate: r.end_date,
      totalPrice: r.total_price,
      status: r.status,
      requestedAt: r.requested_at,
      respondedAt: r.responded_at
    }));

    res.json(requests);
  } catch (error) {
    console.error("Error fetching rental requests:", error);
    res.status(500).json({ message: "Error fetching rental requests" });
  }
});

// Legacy: Create rental (Direct acceptance - for backward compatibility)
// This now creates a rental_requests first and should be accepted by admin


// Get user rentals
app.get("/api/rentals/:username", async (req, res) => {
  try {
    // Get user ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', req.params.username)
      .single();

    if (userError || !user) {
      return res.json([]);
    }

    // Get rentals with vehicle details
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        vehicles (
          id,
          title,
          price,
          image_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map to match frontend expectations
    const rentals = data.map(r => ({
      id: r.id,
      username: req.params.username,
      vehicleId: r.vehicle_id,
      vehicleTitle: r.vehicles.title,
      startDate: r.start_date,
      endDate: r.end_date,
      totalPrice: r.total_price,
      status: r.status,
      createdAt: r.created_at
    }));

    res.json(rentals);
  } catch (error) {
    console.error("Error fetching rentals:", error);
    res.status(500).json({ message: "Error fetching rentals" });
  }
});

// --- ADMIN ROUTES ---

const isAdmin = async (req, res, next) => {
  const { username } = req.headers;
  
  if (username === "admin") {
    return next();
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('email', username)
      .single();

    if (error || !user || user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Authentication error" });
  }
};

// Admin: Get all confirmed rentals
app.get("/api/admin/rentals", isAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        users (email, name),
        vehicles (title, price)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const rentals = data.map(r => ({
      id: r.id,
      username: r.users.email,
      vehicleId: r.vehicle_id,
      vehicleTitle: r.vehicles.title,
      startDate: r.start_date,
      endDate: r.end_date,
      totalPrice: r.total_price,
      status: r.status,
      createdAt: r.created_at
    }));

    res.json(rentals);
  } catch (error) {
    console.error("Error fetching rentals:", error);
    res.status(500).json({ message: "Error fetching rentals" });
  }
});

// Admin: Get all pending rental requests
app.get("/api/admin/rental-requests", isAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rental_requests')
      .select(`
        *,
        users (email, name),
        vehicles (title, price, image_url, category)
      `)
      .eq('status', 'pending')
      .order('requested_at', { ascending: true });

    if (error) throw error;

    const requests = data.map(r => ({
      id: r.id,
      username: r.users.email,
      userName: r.users.name,
      vehicleId: r.vehicle_id,
      vehicleTitle: r.vehicles.title,
      vehicleCategory: r.vehicles.category,
      vehicleImage: r.vehicles.image_url,
      startDate: r.start_date,
      endDate: r.end_date,
      totalPrice: r.total_price,
      status: r.status,
      requestedAt: r.requested_at
    }));

    res.json(requests);
  } catch (error) {
    console.error("Error fetching rental requests:", error);
    res.status(500).json({ message: "Error fetching rental requests" });
  }
});

// Admin: Get all rental requests (any status)
app.get("/api/admin/rental-requests/all", isAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rental_requests')
      .select(`
        *,
        users (email, name),
        vehicles (title, price, image_url, category)
      `)
      .order('requested_at', { ascending: false });

    if (error) throw error;

    const requests = data.map(r => ({
      id: r.id,
      username: r.users.email,
      userName: r.users.name,
      vehicleId: r.vehicle_id,
      vehicleTitle: r.vehicles.title,
      vehicleCategory: r.vehicles.category,
      vehicleImage: r.vehicles.image_url,
      startDate: r.start_date,
      endDate: r.end_date,
      totalPrice: r.total_price,
      status: r.status,
      requestedAt: r.requested_at,
      respondedAt: r.responded_at
    }));

    res.json(requests);
  } catch (error) {
    console.error("Error fetching rental requests:", error);
    res.status(500).json({ message: "Error fetching rental requests" });
  }
});

// Admin: Accept rental request
app.put("/api/admin/rental-requests/:id/accept", isAdmin, async (req, res) => {
  try {
    const requestId = req.params.id;

    // Get the rental request
    const { data: rentalRequest, error: getError } = await supabase
      .from('rental_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (getError || !rentalRequest) {
      return res.status(404).json({ message: "Rental request not found" });
    }

    if (rentalRequest.status !== 'pending') {
      return res.status(400).json({ message: "Only pending requests can be accepted" });
    }

    // Update request status to accepted
    const { data: updatedRequest, error: updateError } = await supabase
      .from('rental_requests')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Create a confirmed rental
    const { data: rental, error: rentalError } = await supabase
      .from('rentals')
      .insert([{
        user_id: rentalRequest.user_id,
        vehicle_id: rentalRequest.vehicle_id,
        start_date: rentalRequest.start_date,
        end_date: rentalRequest.end_date,
        total_price: rentalRequest.total_price,
        status: 'confirmed'
      }])
      .select()
      .single();

    if (rentalError) throw rentalError;

    res.json({ 
      message: "Rental request accepted successfully",
      request: updatedRequest,
      rental: rental
    });
  } catch (error) {
    console.error("Error accepting rental request:", error);
    res.status(500).json({ message: "Error accepting rental request" });
  }
});

// Admin: Reject rental request
app.put("/api/admin/rental-requests/:id/reject", isAdmin, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { reason } = req.body;

    // Get the rental request
    const { data: rentalRequest, error: getError } = await supabase
      .from('rental_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (getError || !rentalRequest) {
      return res.status(404).json({ message: "Rental request not found" });
    }

    if (rentalRequest.status !== 'pending') {
      return res.status(400).json({ message: "Only pending requests can be rejected" });
    }

    // Update request status to rejected
    const { data: updatedRequest, error: updateError } = await supabase
      .from('rental_requests')
      .update({
        status: 'rejected',
        responded_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({ 
      message: "Rental request rejected",
      request: updatedRequest,
      reason: reason || "No reason provided"
    });
  } catch (error) {
    console.error("Error rejecting rental request:", error);
    res.status(500).json({ message: "Error rejecting rental request" });
  }
});

// Admin: Add new vehicle

app.post("/api/vehicles", isAdmin, async (req, res) => {
  try {
    const { title, price, seats, location, featured, category, img } = req.body;

    const { data, error } = await supabase
      .from('vehicles')
      .insert([{
        title,
        price: parseInt(price),
        seats: parseInt(seats),
        location,
        featured: featured || false,
        category,
        rating: 0,
        image_url: img
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ 
      message: "Vehicle added successfully", 
      vehicle: data 
    });
  } catch (error) {
    console.error("Error adding vehicle:", error);
    res.status(500).json({ message: "Error adding vehicle" });
  }
});

// Admin: Delete vehicle
app.delete("/api/vehicles/:id", isAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', parseInt(req.params.id));

    if (error) throw error;

    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({ message: "Error deleting vehicle" });
  }
});

// Start Server
testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT} with Supabase`);
  });
});
