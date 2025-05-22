const express = require('express');
const supabase = require('../supabaseClient');

const router = express.Router();

// Get audit logs
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
