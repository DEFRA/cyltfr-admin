const nodemailer = require('nodemailer')
const cron = require('node-cron')
const S3Provider = require('../providers/s3') // Ensure provider is imported
const config = require('../config')


const createCronJob = async () => {

  // Ensure the function is async to handle promises properly
  cron.schedule('0 16 * * *', async () => {
    console.log('Running cron job: Checking pending approvals...')
    
    try {
      const providerInstance = new S3Provider() 
      console.log('provider:', providerInstance)
      const approvedUsers = await providerInstance.getApprovedUsers()
      const comments = await providerInstance.getFile()
      console.log('approvedUsers:', approvedUsers)

      if (comments && comments.length > 0) {
        console.log('Sending email notifications...')
        
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'michael.steinacher.defra@gmail.com',
            pass: config.EMAIL_PASSWORD, // Just added this so might break!
          },
        })

        const sendReminder = async (recipientEmail) => {
          const mailOptions = {
            from: '"Approval System" <michael.steinacher.defra@gmail.com>',
            to: recipientEmail,
            subject: 'Reminder: Pending Items for Approval',
            text: 'You have pending items that require your approval. Please review them.',
          }

          try {
            let info = await transporter.sendMail(mailOptions)
            console.log(`Email sent to ${recipientEmail}:`, info.response)
          } catch (error) {
            console.error('Error sending email:', error)
          }
        }

        // Example: Send an email if comments exist

        await sendReminder(approvedUsers.email)

        // ✅ Store data in S3
        // await s3Client.send(new PutObjectCommand({
        //   Bucket: 'email-notified-approvers',
        //   Key: `approvers-${Date.now()}.json`,
        //   Body: JSON.stringify(comments),
        // }))
      } else {
        console.log('No pending approvals. Skipping email notifications.')
      }
    } catch (error) {
      console.error('Error in cron job:', error)
    }
  })

  console.log('Cron job scheduled to run daily at 8:17 AM')
}

module.exports = createCronJob
