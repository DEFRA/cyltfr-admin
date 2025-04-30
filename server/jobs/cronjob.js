const cron = require('node-cron')
const S3Provider = require('../providers/s3') // Ensure provider is imported
const config = require('../config')
let NotifyClient = require("notifications-node-client").NotifyClient

let notifyClient = new NotifyClient('cyltfradminconsoleapi-baa45acb-01a8-4ca6-9ef1-42ada5918b1d-f1a7ea92-ba19-4bae-afd7-72489ea451ae')

let options = {
  personalisation: {
      first_name: "Michael"
  }
}

const createCronJob = async () => {

  // Ensure the function is async to handle promises properly
  cron.schedule('03 14 * * *', async () => {
    console.log('Running cron job: Checking pending approvals...')
    
    try {
      const providerInstance = new S3Provider() 
      // const approvedUsers = await providerInstance.getApprovedUsers()
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
        .sendEmail(config.govNotifyApi, approvedUser.email, options) // Pass options as the third argument (optional)
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
