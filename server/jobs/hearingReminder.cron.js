const cron = require('node-cron');
const Hearing = require('../models/Hearing.model');
const Notification = require('../models/Notification.model');
const transporter = require('../config/nodemailer');

/**
 * Formats a Date object as "DD MMMM YYYY" (e.g. "07 June 2026").
 */
const formatDate = (date) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const d = String(date.getDate()).padStart(2, '0');
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
};

/**
 * Computes startOfDay (00:00:00.000) and endOfDay (23:59:59.999)
 * for a date that is `daysAhead` days from now.
 */
const getDateRange = (daysAhead) => {
  const target = new Date();
  target.setDate(target.getDate() + daysAhead);
  const startOfDay = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59, 59, 999);
  return { startOfDay, endOfDay };
};

/**
 * Builds a professional HTML email body for hearing reminders.
 */
const buildEmailHtml = (caseTitle, hearingDate, hearingTime, courtName, daysAway) => {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto;">
      <tr>
        <td style="background-color: #1D4ED8; padding: 24px 32px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">LegalDesk</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 32px;">
          <h2 style="color: #0F172A; margin: 0 0 16px 0; font-size: 18px;">Hearing Reminder</h2>
          <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
            This is an automated reminder that your hearing is scheduled in <strong>${daysAway} day(s)</strong>.
          </p>
          <table width="100%" cellpadding="8" cellspacing="0" border="0" style="background-color: #F8FAFC; border-radius: 8px;">
            <tr>
              <td style="color: #64748B; font-size: 13px; width: 120px; vertical-align: top;">Case</td>
              <td style="color: #0F172A; font-size: 14px; font-weight: 600;">${caseTitle}</td>
            </tr>
            <tr>
              <td style="color: #64748B; font-size: 13px; vertical-align: top;">Date</td>
              <td style="color: #0F172A; font-size: 14px;">${hearingDate}</td>
            </tr>
            ${hearingTime ? `
            <tr>
              <td style="color: #64748B; font-size: 13px; vertical-align: top;">Time</td>
              <td style="color: #0F172A; font-size: 14px;">${hearingTime}</td>
            </tr>` : ''}
            ${courtName ? `
            <tr>
              <td style="color: #64748B; font-size: 13px; vertical-align: top;">Court</td>
              <td style="color: #0F172A; font-size: 14px;">${courtName}</td>
            </tr>` : ''}
          </table>
          <p style="color: #94A3B8; font-size: 12px; margin: 24px 0 0 0;">
            This is an automated reminder from LegalDesk. Please contact your lawyer for any questions.
          </p>
        </td>
      </tr>
      <tr>
        <td style="background-color: #F1F5F9; padding: 16px 32px; text-align: center;">
          <p style="color: #94A3B8; font-size: 11px; margin: 0;">&copy; ${new Date().getFullYear()} LegalDesk. All rights reserved.</p>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Processes hearings for a specific interval (1, 3, or 7 days ahead).
 */
const processInterval = async (daysAhead, reminderField) => {
  const { startOfDay, endOfDay } = getDateRange(daysAhead);
  let sentCount = 0;

  const hearings = await Hearing.find({
    date: { $gte: startOfDay, $lte: endOfDay },
    [`reminders.${reminderField}`]: false,
  }).populate({
    path: 'case',
    populate: { path: 'client', select: 'name email' },
  });

  for (const hearing of hearings) {
    try {
      const clientUser = hearing.case?.client;
      if (!clientUser || !clientUser.email) continue;

      const caseTitle = hearing.case.title || 'Untitled Case';
      const hearingDateFormatted = formatDate(hearing.date);

      // Send email
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"LegalDesk" <noreply@legaldesk.in>',
        to: clientUser.email,
        subject: `Hearing Reminder — ${caseTitle} in ${daysAhead} day(s)`,
        html: buildEmailHtml(caseTitle, hearingDateFormatted, hearing.time, hearing.court, daysAhead),
      });

      // Mark reminder as sent atomically
      await Hearing.findByIdAndUpdate(hearing._id, {
        $set: { [`reminders.${reminderField}`]: true },
      });

      // Create notification
      await Notification.create({
        user: clientUser._id,
        type: 'hearing_reminder',
        title: 'Upcoming Hearing',
        message: `Your hearing for ${caseTitle} is scheduled on ${hearingDateFormatted}.`,
        case: hearing.case._id,
        isRead: false,
      });

      sentCount++;
    } catch (itemErr) {
      console.error(`[CRON] Failed to process hearing ${hearing._id} (${daysAhead}d): ${itemErr.message}`);
    }
  }

  return sentCount;
};

/**
 * Starts the hearing reminder cron job.
 * Schedule: daily at 08:00 IST (Asia/Kolkata).
 */
const startHearingReminderCron = () => {
  const task = cron.schedule('30 2 * * *', async () => {
    const timestamp = new Date().toISOString();
    console.log(`[CRON] Hearing reminder job started at ${timestamp}`);

    try {
      const sent1 = await processInterval(1, 'sent1day');
      const sent3 = await processInterval(3, 'sent3day');
      const sent7 = await processInterval(7, 'sent7day');
      const total = sent1 + sent3 + sent7;

      console.log(`[CRON] Hearing reminder job completed — ${total} reminders sent (1d: ${sent1}, 3d: ${sent3}, 7d: ${sent7})`);
    } catch (err) {
      console.error(`[CRON] Hearing reminder job failed: ${err.message}`);
    }
  });

  task.start();
};

module.exports = { startHearingReminderCron };
