import nodemailer from 'nodemailer';
import User from '@/lib/models/user'; 

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});


export async function sendStatusChangeEmail(service, oldStatus, newStatus) {
  const emailTemplate = `
    <h2>Service Status Change Alert</h2>
    <p>The status of service "${service.name}" has changed:</p>
    <ul>
      <li>Previous Status: ${oldStatus}</li>
      <li>New Status: ${newStatus}</li>
    </ul>
    <p>Time: ${new Date().toLocaleString()}</p>
  `;

  try {
    // Fetch all user emails as plain objects
    const users = await User.find().select('email').lean(); // Use .lean() to return plain objects
    const emailRecipients = users.map(user => user.email).join(', '); // Join emails

    await transporter.sendMail({
      from: process.env.SMTP_FROM_ADDRESS,
      to: emailRecipients, // Use the joined email string
      subject: `Status Change Alert: ${service.name}`,
      html: emailTemplate,
    });
    console.log('Status change email sent successfully');
} catch (error) {
    console.error('Error sending status change email:', error);
}
}