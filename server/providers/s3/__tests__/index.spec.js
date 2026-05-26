const S3Provider = require('..')
const { S3Client } = require('@aws-sdk/client-s3')

jest.mock('@aws-sdk/client-s3')

describe('S3Provider distributed locking', () => {
  let provider
  let mockSend

  beforeEach(() => {
    jest.clearAllMocks()
    provider = new S3Provider()
    mockSend = jest.fn()
    S3Client.prototype.send = mockSend
  })

  describe('acquireLock', () => {
    test('acquires lock when no lock exists', async () => {
      // No lock file exists (NoSuchKey error)
      mockSend.mockRejectedValueOnce({ name: 'NoSuchKey' })
      // PutObject succeeds (lock acquired)
      mockSend.mockResolvedValueOnce({})

      const result = await provider.acquireLock('test-lock', 300)

      expect(result).toBe(true)
      expect(mockSend).toHaveBeenCalledTimes(2)
    })

    test('fails to acquire lock when another process holds it', async () => {
      // Lock file exists with fresh timestamp
      mockSend.mockResolvedValueOnce({
        Body: {
          transformToString: jest.fn().mockResolvedValue(JSON.stringify({ acquiredAt: Date.now() }))
        }
      })

      const result = await provider.acquireLock('test-lock', 300)

      expect(result).toBe(false)
      expect(mockSend).toHaveBeenCalledTimes(1)
    })

    test('overwrites stale lock and acquires it', async () => {
      const staleTime = Date.now() - (400 * 1000)
      // Lock file exists but is stale
      mockSend.mockResolvedValueOnce({
        Body: {
          transformToString: jest.fn().mockResolvedValue(JSON.stringify({ acquiredAt: staleTime }))
        }
      })
      mockSend.mockResolvedValueOnce({})

      const result = await provider.acquireLock('test-lock', 300)

      expect(result).toBe(true)
      expect(mockSend).toHaveBeenCalledTimes(2)
    })

    test('returns false when lock creation fails due to PreconditionFailed', async () => {
      mockSend.mockRejectedValueOnce({ name: 'NoSuchKey' })
      mockSend.mockRejectedValueOnce({
        name: 'PreconditionFailed',
        $metadata: { httpStatusCode: 412 }
      })

      const result = await provider.acquireLock('test-lock', 300)

      expect(result).toBe(false)
    })

    test('throws on unexpected S3 errors', async () => {
      mockSend.mockRejectedValueOnce(new Error('S3 service error'))

      await expect(provider.acquireLock('test-lock', 300)).rejects.toThrow('S3 service error')
    })
  })

  describe('releaseLock', () => {
    test('successfully deletes lock file', async () => {
      mockSend.mockResolvedValueOnce({})

      await provider.releaseLock('test-lock')

      expect(mockSend).toHaveBeenCalledTimes(1)
    })

    test('handles deletion errors gracefully', async () => {
      mockSend.mockRejectedValueOnce(new Error('Delete failed'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await provider.releaseLock('test-lock')

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error releasing distributed lock 'test-lock'"),
        expect.any(Error)
      )
      consoleSpy.mockRestore()
    })
  })
})
