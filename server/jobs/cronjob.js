const cron = require('node-cron')
const S3Provider = require('../providers/s3')
const config = require('../config')
const NotifyClient = require('notifications-node-client').NotifyClient

const onJobCalled = async (providerInstance, notifyClient) => {
  console.log('Running cron job: Checking pending approvals...')

  try {
    const { getApprovedUsers } = await import('../helpers.mjs')
    const validUsers = await getApprovedUsers(providerInstance)

    const comments = (await providerInstance.getFile()).filter((item) => {
      return (!item.approvedAt)
    }).sort((item1, item2) => {
      return 0 - (Date.parse(item1.updatedAt) - Date.parse(item2.updatedAt))
    })
    const dateFormatter = new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
      timeStyle: 'medium'
    })

    if (comments && comments.length > 0) {
      await Promise.all(validUsers.map(async (approvedUser) => {
        const options = { personalisation: {} }
        if (!approvedUser.sentEmails) {
          approvedUser.sentEmails = {}
        }
        options.personalisation.approval_list = ''
        comments.forEach((comment) => {
          const previousComment = approvedUser.sentEmails[comment.id]
          if ((!previousComment) || (Date.parse(previousComment.updatedAt) < Date.parse(comment.updatedAt))) {
            const emailLine = '[' + comment.description + '](' + config.homePage +
                          '/comment/edit/' + comment.id + ') - Last updated ' +
                          dateFormatter.format(Date.parse(comment.updatedAt)) +
                          ' at ' + timeFormatter.format(Date.parse(comment.updatedAt)) +
                          ' by ' + comment.updatedBy + '\n\n'
            options.personalisation.approval_list = options.personalisation.approval_list + emailLine
            approvedUser.sentEmails[comment.id] = ({ updatedAt: comment.updatedAt })
          }
        })
        if (options.personalisation.approval_list !== '') {
          try {
            await notifyClient.sendEmail(config.templateId, approvedUser.email, options)
            await providerInstance.uploadApproverObject(approvedUser.id, approvedUser)
            // save user back to s3 bucket to store sent comment ids
          } catch (err) {
            console.error('Error while sending email: ', err)
          }
        }
      }))
    }
  } catch (error) {
    console.error('Error in cron job:', error)
  }
}

const scheduledJob = async () => {
  const providerInstance = new S3Provider()
  const notifyClient = new NotifyClient(config.govNotifyApiKey)
  onJobCalled(providerInstance, notifyClient)
}

const createCronJob = async () => {
  // Ensure the function is async to handle promises properly
  const options = {
    scheduled: true,
    recoverMissedExecutions: false,
    runOnInit: config.sendEmailsOnStartup
  }
  cron.schedule(config.notifyCron, scheduledJob, options)
}

module.exports = { createCronJob, onJobCalled }
