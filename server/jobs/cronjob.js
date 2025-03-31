const nodemailer = require('nodemailer');
const cron = require('node-cron');

// Configure SMTP transporter (using Gmail as an example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'michael.steinacher.defra@gmail.com',
    pass: 'byhi kooz oawg rovy', // Use an App Password instead of your real password
  },
});

// Function to send reminder email
const sendReminder = async (recipientEmail) => {
  const mailOptions = {
    from: '"Approval System" <michael.steinacher.defra@gmail.com>',
    to: recipientEmail,
    subject: 'Reminder: Pending Items for Approval',
    text: 'You have pending items that require your approval. Please review them.',
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Schedule the cron job to run at 9 AM daily
cron.schedule('41 9 * * *', () => {
  console.log('Running cron job: Sending reminder emails');
  sendReminder('michael.steinacher@defra.gov.uk');
})

console.log('Cron job scheduled to run daily at 9 AM');
