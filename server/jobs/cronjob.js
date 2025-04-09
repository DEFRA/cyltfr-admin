const nodemailer = require('nodemailer')
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
  cron.schedule('59 9 * * *', async () => {
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

        const filteredUserList = userList.filter(Boolean)
        
        // Example: Send an email if comments exist
        filteredUserList.forEach(async (approvedUser) => {
          notifyClient
        .sendEmail(config.govNotifyApi, approvedUser.email, options) // Pass options as the third argument (optional)
        .then(response => console.log(response))
        .catch(err => console.error(err))
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
