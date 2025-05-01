const cron = require('node-cron')
const S3Provider = require('../providers/s3') // Ensure provider is imported
const config = require('../config')
let NotifyClient = require("notifications-node-client").NotifyClient

let notifyClient = new NotifyClient(config.govNotifyApi)

const createCronJob = async () => {

  // Ensure the function is async to handle promises properly
  cron.schedule('00 9 * * *', async () => {
    console.log('Running cron job: Checking pending approvals...')
    
    try {
      const providerInstance = new S3Provider() 
      const bucketContents = await providerInstance.listBucketContents()
      const userList = await Promise.all(
        bucketContents
          .map(async (item) => {
            const itemId = item.Key.split('/').pop()
            if (!itemId) {
              return null // Skip this item
            }
    
            try {
              const getApprovedUsers = await providerInstance.getApprovedUsers(itemId)
              return getApprovedUsers // Return the data
            } catch (error) {
              console.error(`Error fetching user data for ${itemId}:`, error)
              return null
            }
          })
      )
      const comments = await providerInstance.getFile()

      if (comments && comments.length > 0) {

        const filteredUserList = userList.filter(Boolean)
        
        // Example: Send an email if comments exist
        filteredUserList.forEach(async (approvedUser) => {
          console.log('Sending email to:', approvedUser.email)
          notifyClient
        .sendEmail(config.templateId, approvedUser.email)
        .then(response => console.log(response))
        .catch(err => console.error('Error while sending email: ', err))
        })

      } else {
        console.log('No pending approvals. Skipping email notifications.')
      }
    } catch (error) {
      console.error('Error in cron job:', error)
    }
  })
}

module.exports = createCronJob
