import { pool } from '../utils/db.js';
import { logChange } from '../utils/logChange.js';

// -------------------- Helper: Get current user --------------------
const getChangedBy = (req) => {
  const user = req.session?.user;
  if (!user) return "System";
  return `${user.first_name || "Unknown"} ${user.last_name || ""}`.trim();
};

// -------------------- CREATE CLIENT --------------------
export const createClient = async (req, res) => {
  try {
    const { first_name, last_name, email, phone_number, address, city, postal_code } = req.body;

    if (!first_name || !last_name || !email || !phone_number) {
      return res.status(400).json({ message: "first_name, last_name, email, and phone_number are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO clients 
        (first_name, last_name, email, phone_number, address, city, postal_code) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone_number, address || null, city || null, postal_code || null]
    );

    const [newClient] = await pool.query("SELECT * FROM clients WHERE client_id = ?", [result.insertId]);

    // Log creation
    await logChange({
      entity_type: 'client',
      entity_id: result.insertId,
      action: 'create',
      changed_by: getChangedBy(req),
      changes: { before: null, after: newClient[0] },
    });

    res.status(201).json(newClient[0]);
  } catch (err) {
    console.error("createClient error:", err);
    res.status(500).json({ message: "Server error creating client" });
  }
};

// -------------------- READ ALL CLIENTS --------------------
export const getAllClients = async (req, res) => {
  try {
    const [clients] = await pool.query("SELECT * FROM clients ORDER BY client_id DESC");
    res.json(clients);
  } catch (err) {
    console.error("getAllClients error:", err);
    res.status(500).json({ message: "Server error fetching clients" });
  }
};

// -------------------- READ CLIENT BY ID --------------------
export const getClientById = async (req, res) => {
  try {
    const { client_id } = req.params;
    const [clients] = await pool.query("SELECT * FROM clients WHERE client_id = ?", [client_id]);

    if (clients.length === 0) return res.status(404).json({ message: "Client not found" });

    res.json(clients[0]);
  } catch (err) {
    console.error("getClientById error:", err);
    res.status(500).json({ message: "Server error fetching client" });
  }
};

// -------------------- UPDATE CLIENT --------------------
export const updateClient = async (req, res) => {
  try {
    const { client_id } = req.params;
    const { first_name, last_name, email, phone_number, address, city, postal_code } = req.body;

    const [existing] = await pool.query("SELECT * FROM clients WHERE client_id = ?", [client_id]);
    if (existing.length === 0) return res.status(404).json({ message: "Client not found" });

    const oldData = existing[0];

    await pool.query(
      `UPDATE clients SET 
        first_name = ?, last_name = ?, email = ?, phone_number = ?, address = ?, city = ?, postal_code = ? 
       WHERE client_id = ?`,
      [
        first_name ?? oldData.first_name,
        last_name ?? oldData.last_name,
        email ?? oldData.email,
        phone_number ?? oldData.phone_number,
        address ?? oldData.address,
        city ?? oldData.city,
        postal_code ?? oldData.postal_code,
        client_id,
      ]
    );

    const [updatedClient] = await pool.query("SELECT * FROM clients WHERE client_id = ?", [client_id]);

    // Log update
    await logChange({
      entity_type: 'client',
      entity_id: client_id,
      action: 'update',
      changed_by: getChangedBy(req),
      changes: { before: oldData, after: updatedClient[0] },
    });

    res.json(updatedClient[0]);
  } catch (err) {
    console.error("updateClient error:", err);
    res.status(500).json({ message: "Server error updating client" });
  }
};

// -------------------- DELETE CLIENT --------------------
export const deleteClient = async (req, res) => {
  try {
    const { client_id } = req.params;

    const [existing] = await pool.query("SELECT * FROM clients WHERE client_id = ?", [client_id]);
    if (existing.length === 0) return res.status(404).json({ message: "Client not found" });

    await pool.query("DELETE FROM clients WHERE client_id = ?", [client_id]);

    // Log deletion
    await logChange({
      entity_type: 'client',
      entity_id: client_id,
      action: 'delete',
      changed_by: getChangedBy(req),
      changes: { before: existing[0], after: null },
    });

    res.json({ message: "Client deleted successfully" });
  } catch (err) {
    console.error("deleteClient error:", err);
    res.status(500).json({ message: "Server error deleting client" });
  }
};

// -------------------- GET CLIENT APPOINTMENT HISTORY --------------------
export const getClientAppointmentHistory = async (req, res) => {
  try {
    const { client_id } = req.params;

    // Get completed appointments from history
    const [history] = await pool.query(
      `SELECT 
        ah.appointment_id,
        ah.client_name,
        ah.service_name,
        ah.service_price,
        ah.service_category,
        ah.appointment_date,
        ah.start_time,
        ah.end_time,
        ah.status,
        ah.completed_at,
        ah.notes,
        ah.staff_id,
        s.first_name AS staff_first_name,
        s.last_name AS staff_last_name,
        'history' AS source
       FROM appointmenthistory ah
       LEFT JOIN staff s ON ah.staff_id = s.staff_id
       WHERE ah.client_name = (
         SELECT CONCAT(first_name, ' ', last_name) 
         FROM clients 
         WHERE client_id = ?
       )
       ORDER BY ah.completed_at DESC, ah.appointment_date DESC
       LIMIT 100`,
      [client_id]
    );

    // Get upcoming/pending appointments
    const [appointments] = await pool.query(
      `SELECT 
        a.appointment_id,
        CONCAT(c.first_name, ' ', c.last_name) AS client_name,
        s.name AS service_name,
        s.price AS service_price,
        s.category AS service_category,
        a.appointment_date,
        TIME(a.start_time) AS start_time,
        TIME(a.end_time) AS end_time,
        a.status,
        NULL AS completed_at,
        a.notes,
        a.staff_id,
        st.first_name AS staff_first_name,
        st.last_name AS staff_last_name,
        'appointment' AS source
       FROM appointments a
       JOIN clients c ON a.client_id = c.client_id
       JOIN services s ON a.service_id = s.service_id
       LEFT JOIN staff st ON a.staff_id = st.staff_id
       WHERE a.client_id = ?
       AND a.status NOT IN ('cancelled', 'declined')
       ORDER BY a.appointment_date DESC, a.start_time DESC
       LIMIT 50`,
      [client_id]
    );

    // Combine and sort by date
    const allAppointments = [...history, ...appointments].sort((a, b) => {
      const dateA = new Date(a.appointment_date + ' ' + (a.completed_at || a.start_time));
      const dateB = new Date(b.appointment_date + ' ' + (b.completed_at || b.start_time));
      return dateB - dateA;
    });

    res.json({ appointments: allAppointments });
  } catch (err) {
    console.error("getClientAppointmentHistory error:", err);
    res.status(500).json({ message: "Server error fetching client appointment history" });
  }
};

// -------------------- DASHBOARD OVERVIEW FOR CLIENTS --------------------
export const getClientsDashboard = async (req, res) => {
  try {
    // Total clients
    const [[totalClients]] = await pool.query(
      `SELECT COUNT(*) AS count FROM clients`
    );

    // Clients with appointments
    const [[clientsWithAppointments]] = await pool.query(
      `SELECT COUNT(DISTINCT client_id) AS count FROM appointments`
    );

    // Recent clients (last 30 days) - if you have a created_at field
    // For now, we'll just return basic counts
    res.json({
      counts: {
        totalClients: totalClients.count || 0,
        clientsWithAppointments: clientsWithAppointments.count || 0,
      },
    });
  } catch (err) {
    console.error("getClientsDashboard error:", err);
    res.status(500).json({ message: "Server error fetching clients dashboard" });
  }
};