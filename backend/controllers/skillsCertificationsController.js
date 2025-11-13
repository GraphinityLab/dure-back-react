/* eslint-disable no-undef */
import { pool } from '../utils/db.js';
import { logChange } from '../utils/logChange.js';

// -------------------- Helper: Get current user --------------------
const getChangedBy = (req) => {
  const user = req.session?.user;
  if (!user) return "Unknown";
  return `${user.first_name || "Unknown"} ${user.last_name || ""}`.trim();
};

// -------------------- SKILLS --------------------

// Get all skills
export const getSkills = async (req, res) => {
  try {
    const [skills] = await pool.query(
      `SELECT * FROM skills ORDER BY category, skill_name`
    );
    res.json({ skills });
  } catch (err) {
    console.error("getSkills error:", err);
    res.status(500).json({ message: "Server error fetching skills" });
  }
};

// Create skill
export const createSkill = async (req, res) => {
  try {
    const { skill_name, category, description } = req.body;

    if (!skill_name) {
      return res.status(400).json({ message: "Skill name is required" });
    }

    const [result] = await pool.query(
      `INSERT INTO skills (skill_name, category, description)
       VALUES (?, ?, ?)`,
      [skill_name, category || null, description || null]
    );

    res.status(201).json({ message: "Skill created", skill_id: result.insertId });
  } catch (err) {
    console.error("createSkill error:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Skill already exists" });
    }
    res.status(500).json({ message: "Server error creating skill" });
  }
};

// Get staff skills
export const getStaffSkills = async (req, res) => {
  try {
    const { staff_id } = req.params;

    const [skills] = await pool.query(
      `SELECT ss.*, s.skill_name, s.category, s.description,
              verifier.first_name AS verifier_first_name,
              verifier.last_name AS verifier_last_name
       FROM staff_skills ss
       JOIN skills s ON ss.skill_id = s.skill_id
       LEFT JOIN staff verifier ON ss.verified_by = verifier.staff_id
       WHERE ss.staff_id = ?`,
      [staff_id]
    );

    res.json({ skills });
  } catch (err) {
    console.error("getStaffSkills error:", err);
    res.status(500).json({ message: "Server error fetching staff skills" });
  }
};

// Assign skill to staff
export const assignSkillToStaff = async (req, res) => {
  try {
    const { staff_id } = req.params;
    const { skill_id, proficiency_level, years_experience, notes } = req.body;

    if (!skill_id) {
      return res.status(400).json({ message: "Skill ID is required" });
    }

    const [existing] = await pool.query(
      `SELECT * FROM staff_skills WHERE staff_id = ? AND skill_id = ?`,
      [staff_id, skill_id]
    );

    if (existing.length > 0) {
      // Update existing
      await pool.query(
        `UPDATE staff_skills 
         SET proficiency_level = ?, years_experience = ?, notes = ?
         WHERE staff_id = ? AND skill_id = ?`,
        [proficiency_level || 'intermediate', years_experience || null, notes || null, staff_id, skill_id]
      );
      res.json({ message: "Skill updated" });
    } else {
      // Create new
      const [result] = await pool.query(
        `INSERT INTO staff_skills (staff_id, skill_id, proficiency_level, years_experience, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [staff_id, skill_id, proficiency_level || 'intermediate', years_experience || null, notes || null]
      );
      res.status(201).json({ message: "Skill assigned", staff_skill_id: result.insertId });
    }
  } catch (err) {
    console.error("assignSkillToStaff error:", err);
    res.status(500).json({ message: "Server error assigning skill" });
  }
};

// Remove skill from staff
export const removeSkillFromStaff = async (req, res) => {
  try {
    const { staff_id, skill_id } = req.params;

    await pool.query(
      `DELETE FROM staff_skills WHERE staff_id = ? AND skill_id = ?`,
      [staff_id, skill_id]
    );

    res.json({ message: "Skill removed" });
  } catch (err) {
    console.error("removeSkillFromStaff error:", err);
    res.status(500).json({ message: "Server error removing skill" });
  }
};

// -------------------- CERTIFICATIONS --------------------

// Get staff certifications
export const getStaffCertifications = async (req, res) => {
  try {
    const { staff_id } = req.params;

    const [certifications] = await pool.query(
      `SELECT * FROM certifications 
       WHERE staff_id = ? 
       ORDER BY expiry_date DESC, issue_date DESC`,
      [staff_id]
    );

    res.json({ certifications });
  } catch (err) {
    console.error("getStaffCertifications error:", err);
    res.status(500).json({ message: "Server error fetching certifications" });
  }
};

// Create certification
export const createCertification = async (req, res) => {
  try {
    const { staff_id } = req.params;
    const {
      certification_name,
      issuing_organization,
      issue_date,
      expiry_date,
      certificate_number,
      document_url,
      notes
    } = req.body;

    if (!certification_name) {
      return res.status(400).json({ message: "Certification name is required" });
    }

    const [result] = await pool.query(
      `INSERT INTO certifications 
       (staff_id, certification_name, issuing_organization, issue_date, expiry_date, 
        certificate_number, document_url, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        staff_id, certification_name, issuing_organization || null,
        issue_date || null, expiry_date || null, certificate_number || null,
        document_url || null, notes || null
      ]
    );

    await logChange({
      entity_type: "certification",
      entity_id: result.insertId,
      action: "create",
      changed_by: getChangedBy(req),
      changes: {
        before: null,
        after: { ...req.body, staff_id }
      },
    });

    res.status(201).json({ message: "Certification created", certification_id: result.insertId });
  } catch (err) {
    console.error("createCertification error:", err);
    res.status(500).json({ message: "Server error creating certification" });
  }
};

// Update certification
export const updateCertification = async (req, res) => {
  try {
    const { certification_id } = req.params;
    const updates = req.body;

    const [existing] = await pool.query(
      `SELECT * FROM certifications WHERE certification_id = ?`,
      [certification_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Certification not found" });
    }

    const allowedFields = [
      'certification_name', 'issuing_organization', 'issue_date', 'expiry_date',
      'certificate_number', 'document_url', 'is_active', 'notes'
    ];

    const updateFields = [];
    const values = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    values.push(certification_id);
    await pool.query(
      `UPDATE certifications SET ${updateFields.join(', ')} WHERE certification_id = ?`,
      values
    );

    await logChange({
      entity_type: "certification",
      entity_id: certification_id,
      action: "update",
      changed_by: getChangedBy(req),
      changes: {
        before: existing[0],
        after: { ...existing[0], ...updates }
      },
    });

    res.json({ message: "Certification updated" });
  } catch (err) {
    console.error("updateCertification error:", err);
    res.status(500).json({ message: "Server error updating certification" });
  }
};

// Delete certification
export const deleteCertification = async (req, res) => {
  try {
    const { certification_id } = req.params;

    const [existing] = await pool.query(
      `SELECT * FROM certifications WHERE certification_id = ?`,
      [certification_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Certification not found" });
    }

    await pool.query(
      `DELETE FROM certifications WHERE certification_id = ?`,
      [certification_id]
    );

    await logChange({
      entity_type: "certification",
      entity_id: certification_id,
      action: "delete",
      changed_by: getChangedBy(req),
      changes: {
        before: existing[0],
        after: null
      },
    });

    res.json({ message: "Certification deleted" });
  } catch (err) {
    console.error("deleteCertification error:", err);
    res.status(500).json({ message: "Server error deleting certification" });
  }
};

// Get expiring certifications
export const getExpiringCertifications = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const [certifications] = await pool.query(
      `SELECT c.*, s.first_name, s.last_name, s.username
       FROM certifications c
       JOIN staff s ON c.staff_id = s.staff_id
       WHERE c.is_active = 1
       AND c.expiry_date IS NOT NULL
       AND c.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
       ORDER BY c.expiry_date ASC`,
      [days]
    );

    res.json({ certifications, days });
  } catch (err) {
    console.error("getExpiringCertifications error:", err);
    res.status(500).json({ message: "Server error fetching expiring certifications" });
  }
};

// -------------------- TRAINING RECORDS --------------------

// Get staff training records
export const getStaffTraining = async (req, res) => {
  try {
    const { staff_id } = req.params;

    const [training] = await pool.query(
      `SELECT * FROM training_records 
       WHERE staff_id = ? 
       ORDER BY start_date DESC`,
      [staff_id]
    );

    res.json({ training });
  } catch (err) {
    console.error("getStaffTraining error:", err);
    res.status(500).json({ message: "Server error fetching training records" });
  }
};

// Create training record
export const createTrainingRecord = async (req, res) => {
  try {
    const { staff_id } = req.params;
    const {
      training_name,
      training_type,
      provider,
      start_date,
      completion_date,
      status,
      certificate_url,
      notes
    } = req.body;

    if (!training_name) {
      return res.status(400).json({ message: "Training name is required" });
    }

    const [result] = await pool.query(
      `INSERT INTO training_records 
       (staff_id, training_name, training_type, provider, start_date, 
        completion_date, status, certificate_url, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        staff_id, training_name, training_type || null, provider || null,
        start_date || null, completion_date || null, status || 'scheduled',
        certificate_url || null, notes || null
      ]
    );

    res.status(201).json({ message: "Training record created", training_id: result.insertId });
  } catch (err) {
    console.error("createTrainingRecord error:", err);
    res.status(500).json({ message: "Server error creating training record" });
  }
};

