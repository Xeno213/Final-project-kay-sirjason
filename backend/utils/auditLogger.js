const supabase = require('../supabaseClient');

async function logAuditEvent(userId, action, details) {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert([{ user_id: userId, action, details, timestamp: new Date().toISOString() }]);

    if (error) {
      console.error('Failed to log audit event:', error.message);
    }
  } catch (err) {
    console.error('Error logging audit event:', err);
  }
}

module.exports = {
  logAuditEvent,
};
