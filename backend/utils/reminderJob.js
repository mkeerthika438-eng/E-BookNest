const cron = require('node-cron');
const pool = require('../config/db');
const { sendMail } = require('./email');
const { createNotification } = require('./notify');

const DUE_SOON_DAYS = parseInt(process.env.DUE_SOON_DAYS || '3');
const FINE_PER_DAY = parseFloat(process.env.FINE_PER_DAY || '5');

async function runReminderCheck() {
  try {
    // --- Books due within the next N days ---
    const [dueSoon] = await pool.query(`
      SELECT br.id, br.due_date, u.id AS user_id, u.name, u.email, b.title
      FROM borrowings br
      JOIN users u ON u.id = br.user_id
      JOIN books b ON b.id = br.book_id
      WHERE br.status = 'active'
        AND br.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
    `, [DUE_SOON_DAYS]);

    for (const row of dueSoon) {
      await createNotification(
        row.user_id, 'Book Due Soon',
        `"${row.title}" is due on ${row.due_date}. Renew it if you need more time.`,
        'due_soon'
      );
      await sendMail({
        to: row.email,
        subject: `Reminder: "${row.title}" is due soon`,
        html: `<p>Hi ${row.name},</p><p>Your book <strong>${row.title}</strong> is due on <strong>${row.due_date}</strong>. Renew it in E-BookNest if you need more time.</p>`
      });
    }

    // --- Overdue books ---
    const [overdue] = await pool.query(`
      SELECT br.id, br.due_date, u.id AS user_id, u.name, u.email, b.title,
        DATEDIFF(CURDATE(), br.due_date) AS days_overdue
      FROM borrowings br
      JOIN users u ON u.id = br.user_id
      JOIN books b ON b.id = br.book_id
      WHERE br.status = 'active' AND br.due_date < CURDATE()
    `);

    for (const row of overdue) {
      const estimatedFine = (row.days_overdue * FINE_PER_DAY).toFixed(2);
      await createNotification(
        row.user_id, 'Book Overdue',
        `"${row.title}" is ${row.days_overdue} day(s) overdue. Estimated fine: ₹${estimatedFine}.`,
        'overdue'
      );
      await sendMail({
        to: row.email,
        subject: `Overdue: "${row.title}"`,
        html: `<p>Hi ${row.name},</p><p>Your book <strong>${row.title}</strong> is <strong>${row.days_overdue} day(s) overdue</strong>. Estimated fine so far: ₹${estimatedFine}. Please return or renew it as soon as possible.</p>`
      });
    }

    console.log(`🔔 Reminder check complete — ${dueSoon.length} due-soon, ${overdue.length} overdue.`);
  } catch (err) {
    console.error('❌ Reminder job failed:', err.message);
  }
}

// Runs once a day at 8:00 AM server time. Also exported so it can be triggered
// manually (e.g. for testing) via utils/runReminderCheck.js.
function startReminderJob() {
  cron.schedule('0 8 * * *', runReminderCheck);
  console.log('⏰ Daily reminder job scheduled (8:00 AM).');
}

module.exports = { startReminderJob, runReminderCheck };
