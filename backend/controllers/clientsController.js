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
