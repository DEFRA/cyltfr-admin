const cron = require('node-cron')
const S3Provider = require('../providers/s3') // Ensure provider is imported
const config = require('../config')
const NotifyClient = require('notifications-node-client').NotifyClient

const notifyClient = new NotifyClient(config.govNotifyApiKey)

const onJobCalled = async () => {
  console.log('Running cron job: Checking pending approvals...')

  try {
    const providerInstance = new S3Provider()
    const emailAddressIds = await providerInstance.listEmailIds()
    const userList = await Promise.all(
      emailAddressIds
        .map(async (itemId) => {
          try {
            const approvedUser = await providerInstance.getApprovedUser(itemId)
            return approvedUser // Return the data
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
    const dateString = new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    const timeString = new Intl.DateTimeFormat('en-GB', {
      timeStyle: 'medium'
    })

    if (comments && comments.length > 0) {
      userList.forEach(async (approvedUser) => {
        console.log('Checking email for:', approvedUser.email)
        const options = { personalisation: {} }
        if (!approvedUser.sentEmails) {
          approvedUser.sentEmails = []
        }
        options.personalisation.approval_list = ''
        comments.forEach((comment) => {
          if (!(approvedUser.sentEmails?.includes(comment.id))) {
            const emailLine = '[' + comment.description + '](' + config.homePage + '/comment/edit/' + comment.id +
                          ') - Last updated ' + dateString.format(Date.parse(comment.updatedAt)) +
                          ' at ' + timeString.format(Date.parse(comment.updatedAt)) +
                          ' by ' + comment.updatedBy + '\n\n'
            options.personalisation.approval_list = options.personalisation.approval_list + emailLine
            approvedUser.sentEmails.push(comment.id)
          }
        })
        if (options.personalisation.approval_list !== '') {
          notifyClient
            .sendEmail(config.templateId, approvedUser.email, options)
            .then((response) => {
              console.log(response)
              console.log('Sending email to:', approvedUser.email)
              providerInstance.uploadApproverObject(approvedUser.id, approvedUser)
              // save user back to s3 bucket to store sent comment ids
            })
            .catch(err => console.error('Error while sending email: ', err))
        } else {
          console.log(`Nothing to send to ${approvedUser.email}`)
        }
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
