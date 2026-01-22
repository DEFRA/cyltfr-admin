const cron = require('node-cron')
const S3Provider = require('../providers/s3') // Ensure provider is imported
const config = require('../config')
const NotifyClient = require('notifications-node-client').NotifyClient

const notifyClient = new NotifyClient(config.govNotifyApiKey)

const onJobCalled = async () => {
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
    const comments = (await providerInstance.getFile()).filter((item) => {
      return (!item.approvedAt)
    }).sort((item1, item2) => {
      return 0 - (Date.parse(item1.updatedAt) - Date.parse(item2.updatedAt))
    })

    if (comments && comments.length > 0) {
      const filteredUserList = await userList.filter(Boolean)
      const options = { personalisation: {} }
      options.personalisation.approval_list = ''
      comments.forEach((comment) => {
        const emailLine = '[' + comment.description + '](' + config.homePage + '/comment/edit/' + comment.id +
                          ') - Last updated ' + new Date(Date.parse(comment.updatedAt)).toLocaleString('en-GB') +
                          ' by ' + comment.updatedBy + '\n\n'
        options.personalisation.approval_list = options.personalisation.approval_list + emailLine
      })

      // Example: Send an email if comments exist
      filteredUserList.forEach(async (approvedUser) => {
        console.log('Sending email to:', approvedUser.email)
        notifyClient
          .sendEmail(config.templateId, approvedUser.email, options)
          .then(response => console.log(response))
          .catch(err => console.error('Error while sending email: ', err))
      })
    } else {
      console.log('No pending approvals. Skipping email notifications.')
    }
  } catch (error) {
    console.error('Error in cron job:', error)
  }
}

const createCronJob = async () => {
  // Ensure the function is async to handle promises properly
  cron.schedule(config.notifyCron, onJobCalled)
}

module.exports = { createCronJob, onJobCalled }
