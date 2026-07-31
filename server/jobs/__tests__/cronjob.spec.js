const cron = require('node-cron')
const S3Provider = require('../../providers/s3')
const { onJobCalled } = require('../cronjob')

jest.mock('node-cron')
jest.mock('../../providers/s3')
jest.mock('notifications-node-client', () => ({
  NotifyClient: jest.fn()
}))
jest.mock('../../config', () => ({
  govNotifyApiKey: 'test-key',
  templateId: 'test-template',
  homePage: 'http://example.com'
}))
jest.mock('../../helpers.mjs', () => ({
  getApprovedUsers: jest.fn()
}))

const { getApprovedUsers } = require('../../helpers.mjs')
const { NotifyClient } = require('notifications-node-client')

describe('cronjob', () => {
  let mockProvider
  let mockNotifyClient

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock provider
    mockProvider = {
      acquireLock: jest.fn(),
      releaseLock: jest.fn(),
      getFile: jest.fn(),
      uploadApproverObject: jest.fn(),
      listEmailIds: jest.fn()
    }
    S3Provider.mockReturnValue(mockProvider)

    // Mock notify client
    mockNotifyClient = {
      sendEmail: jest.fn().mockResolvedValue({})
    }
  })

  describe('onJobCalled', () => {
    test('exits early when lock cannot be acquired', async () => {
      mockProvider.acquireLock.mockResolvedValue(false)

      await onJobCalled(mockProvider, mockNotifyClient)

      expect(mockProvider.acquireLock).toHaveBeenCalledWith('cron-notify-lock', 300)
      expect(mockProvider.getFile).not.toHaveBeenCalled()
      expect(mockProvider.releaseLock).not.toHaveBeenCalled()
    })

    test('acquires lock and releases it after job completes', async () => {
      mockProvider.acquireLock.mockResolvedValue(true)
      mockProvider.getFile.mockResolvedValue([])
      getApprovedUsers.mockResolvedValue([])

      await onJobCalled(mockProvider, mockNotifyClient)

      expect(mockProvider.acquireLock).toHaveBeenCalledWith('cron-notify-lock', 300)
      expect(mockProvider.releaseLock).toHaveBeenCalledWith('cron-notify-lock')
    })

    test('releases lock even when error occurs', async () => {
      mockProvider.acquireLock.mockResolvedValue(true)
      getApprovedUsers.mockRejectedValue(new Error('S3 error'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await onJobCalled(mockProvider, mockNotifyClient)

      expect(mockProvider.releaseLock).toHaveBeenCalledWith('cron-notify-lock')
      consoleSpy.mockRestore()
    })
  })

  describe('createCronJob', () => {
    test('schedules cron job', () => {
      const { createCronJob } = require('../cronjob')
      createCronJob()

      expect(cron.schedule).toHaveBeenCalled()
    })

    test('runs scheduled job with S3Provider and NotifyClient', async () => {
      mockProvider.acquireLock.mockResolvedValue(false)

      const { createCronJob } = require('../cronjob')
      createCronJob()

      const scheduledFn = cron.schedule.mock.calls[0][1]
      await scheduledFn()

      expect(S3Provider).toHaveBeenCalledTimes(1)
      expect(NotifyClient).toHaveBeenCalledWith('test-key')
      expect(mockProvider.acquireLock).toHaveBeenCalledWith('cron-notify-lock', 300)
    })
  })
})
