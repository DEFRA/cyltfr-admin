const nodemailer = require('nodemailer')
const cron = require('node-cron')
const S3Provider = require('../providers/s3') // Ensure provider is imported
const config = require('../config')


const createCronJob = async () => {

  // Ensure the function is async to handle promises properly
  cron.schedule('45 14 * * *', async () => {
    console.log('Running cron job: Checking pending approvals...')
    
    try {
      const providerInstance = new S3Provider() 
      console.log('provider:', providerInstance)
      // const approvedUsers = await providerInstance.getApprovedUsers()
      const bucketContents = await providerInstance.listBucketContents()
      const userList = await Promise.all(
        bucketContents
          .map(async (item) => {
            const itemId = item.Key.split('/').pop()
            if (!itemId) {
              console.log('no itemId')
              return null // Skip this item
            }
    
            try {
              const getApprovedUsers = await providerInstance.getApprovedUsers(itemId)
              console.log('getApprovedUsers:', getApprovedUsers)
              return getApprovedUsers // Return the data
            } catch (error) {
              console.error(`Error fetching user data for ${itemId}:`, error)
              return null
            }
          })
      )
      const comments = await providerInstance.getFile()
      console.log('approvedUsers:', userList)

      if (comments && comments.length > 0) {
        console.log('Sending email notifications...')
        console.log('config.emailPassKey', typeof config.emailPassKey)
        
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'michael.steinacher.defra@gmail.com',
            pass: config.emailPassKey,
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

        const filteredUserList = userList.filter(Boolean)
        // Example: Send an email if comments exist
        filteredUserList.forEach(async (approvedUsers) => {
          await sendReminder(approvedUsers.email)
        })

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
