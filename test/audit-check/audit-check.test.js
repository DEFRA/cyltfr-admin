const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const TEST_DATA_DIR = path.join(__dirname, 'data')
const AUDIT_CHECK_SCRIPT = path.join(__dirname, '../../bin/audit-check')

/**
 * Run audit-check script with provided input
 * @param {string} auditJsonPath - Path to audit JSON file
 * @param {string} packageJsonPath - Path to package.json
 * @param {string} packageLockPath - Path to package-lock.json
 * @returns {Promise<{exitCode: number, stdout: string, stderr: string}>}
 */
function runAuditCheck (auditJsonPath, packageJsonPath, packageLockPath) {
  return new Promise((resolve) => {
    const auditData = fs.readFileSync(auditJsonPath, 'utf8')

    // Create a temporary directory for the test
    const tmpDir = fs.mkdtempSync(path.join(__dirname, 'tmp-'))

    // Copy package files to temp directory if provided
    if (packageJsonPath) {
      fs.copyFileSync(packageJsonPath, path.join(tmpDir, 'package.json'))
    }
    if (packageLockPath) {
      fs.copyFileSync(packageLockPath, path.join(tmpDir, 'package-lock.json'))
    }

    const child = spawn('node', [AUDIT_CHECK_SCRIPT], {
      cwd: tmpDir,
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('close', (exitCode) => {
      // Clean up temp directory
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true })
      } catch (err) {
        // Ignore cleanup errors
      }

      resolve({ exitCode, stdout, stderr })
    })

    // Send audit data to stdin
    child.stdin.write(auditData)
    child.stdin.end()
  })
}

describe('audit-check script', () => {
  describe('no vulnerabilities', () => {
    it('should return exit code 0 when no vulnerabilities found', async () => {
      const result = await runAuditCheck(
        path.join(TEST_DATA_DIR, 'no-vulnerabilities.json'),
        path.join(TEST_DATA_DIR, 'test-package.json'),
        path.join(TEST_DATA_DIR, 'test-package-lock.json')
      )

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('No direct dependency vulnerabilities found')
    })
  })

  describe('low severity only', () => {
    it('should return exit code 0 when only low severity (below moderate threshold)', async () => {
      const result = await runAuditCheck(
        path.join(TEST_DATA_DIR, 'low-severity.json'),
        path.join(TEST_DATA_DIR, 'test-package.json'),
        path.join(TEST_DATA_DIR, 'test-package-lock.json')
      )

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Threshold: MODERATE')
      expect(result.stdout).toContain('Below Threshold Vulnerabilities (informational)')
      expect(result.stdout).toContain('test-package-low')
      expect(result.stdout).toContain('No vulnerabilities at or above "moderate" threshold')
    })
  })

  describe('high severity', () => {
    it('should return exit code 1 when high severity found (above moderate threshold)', async () => {
      const result = await runAuditCheck(
        path.join(TEST_DATA_DIR, 'high-severity.json'),
        path.join(TEST_DATA_DIR, 'test-package.json'),
        path.join(TEST_DATA_DIR, 'test-package-lock.json')
      )

      expect(result.exitCode).toBe(1)
      expect(result.stdout).toContain('Threshold: MODERATE')
      expect(result.stdout).toContain('Vulnerabilities At/Above Threshold')
      expect(result.stdout).toContain('test-package-high')
      expect(result.stdout).toContain('Severity: HIGH')
    })
  })

  describe('mixed severity levels', () => {
    it('should separate vulnerabilities by threshold with default moderate', async () => {
      const result = await runAuditCheck(
        path.join(TEST_DATA_DIR, 'mixed-severity.json'),
        path.join(TEST_DATA_DIR, 'test-package.json'),
        path.join(TEST_DATA_DIR, 'test-package-lock.json')
      )

      expect(result.exitCode).toBe(1)
      expect(result.stdout).toContain('Threshold: MODERATE')

      // Should show low as informational (below threshold)
      expect(result.stdout).toContain('Below Threshold Vulnerabilities (informational)')
      expect(result.stdout).toContain('pkg-low')

      // Should show moderate, high, and critical as failing
      expect(result.stdout).toContain('Vulnerabilities At/Above Threshold')
      expect(result.stdout).toContain('pkg-moderate')
      expect(result.stdout).toContain('pkg-high')
      expect(result.stdout).toContain('pkg-critical')
    })
  })

  describe('custom thresholds', () => {
    it('should respect high threshold setting', async () => {
      // Create a custom package.json with high threshold
      const tmpDir = fs.mkdtempSync(path.join(__dirname, 'tmp-'))
      const customPackageJson = {
        name: 'test-high-threshold',
        version: '1.0.0',
        'audit-check': {
          threshold: 'high'
        }
      }
      fs.writeFileSync(
        path.join(tmpDir, 'package.json'),
        JSON.stringify(customPackageJson, null, 2)
      )
      fs.copyFileSync(
        path.join(TEST_DATA_DIR, 'test-package-lock.json'),
        path.join(tmpDir, 'package-lock.json')
      )

      const auditData = fs.readFileSync(path.join(TEST_DATA_DIR, 'mixed-severity.json'), 'utf8')

      const child = spawn('node', [AUDIT_CHECK_SCRIPT], {
        cwd: tmpDir,
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let stdout = ''
      const result = await new Promise((resolve) => {
        child.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        child.on('close', (exitCode) => {
          fs.rmSync(tmpDir, { recursive: true, force: true })
          resolve({ exitCode, stdout })
        })

        child.stdin.write(auditData)
        child.stdin.end()
      })

      expect(result.exitCode).toBe(1)
      expect(result.stdout).toContain('Threshold: HIGH')

      // Low and moderate should be below threshold
      expect(result.stdout).toContain('Below Threshold Vulnerabilities (informational)')
      expect(result.stdout).toContain('pkg-low')
      expect(result.stdout).toContain('pkg-moderate')

      // Only high and critical should be above threshold
      expect(result.stdout).toContain('Vulnerabilities At/Above Threshold')
      expect(result.stdout).toContain('pkg-high')
      expect(result.stdout).toContain('pkg-critical')
    })

    it('should respect critical threshold setting', async () => {
      const tmpDir = fs.mkdtempSync(path.join(__dirname, 'tmp-'))
      const customPackageJson = {
        name: 'test-critical-threshold',
        version: '1.0.0',
        'audit-check': {
          threshold: 'critical'
        }
      }
      fs.writeFileSync(
        path.join(tmpDir, 'package.json'),
        JSON.stringify(customPackageJson, null, 2)
      )
      fs.copyFileSync(
        path.join(TEST_DATA_DIR, 'test-package-lock.json'),
        path.join(tmpDir, 'package-lock.json')
      )

      const auditData = fs.readFileSync(path.join(TEST_DATA_DIR, 'mixed-severity.json'), 'utf8')

      const child = spawn('node', [AUDIT_CHECK_SCRIPT], {
        cwd: tmpDir,
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let stdout = ''
      const result = await new Promise((resolve) => {
        child.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        child.on('close', (exitCode) => {
          fs.rmSync(tmpDir, { recursive: true, force: true })
          resolve({ exitCode, stdout })
        })

        child.stdin.write(auditData)
        child.stdin.end()
      })

      expect(result.exitCode).toBe(1)
      expect(result.stdout).toContain('Threshold: CRITICAL')

      // Low, moderate, and high should be below threshold
      expect(result.stdout).toContain('Below Threshold Vulnerabilities (informational)')
      expect(result.stdout).toContain('pkg-low')
      expect(result.stdout).toContain('pkg-moderate')
      expect(result.stdout).toContain('pkg-high')

      // Only critical should be above threshold
      expect(result.stdout).toContain('Vulnerabilities At/Above Threshold')
      expect(result.stdout).toContain('pkg-critical')
    })
  })

  describe('accepted leaf vulnerabilities', () => {
    it('should accept vulnerabilities when leaf packages are configured', async () => {
      const result = await runAuditCheck(
        path.join(TEST_DATA_DIR, 'accepted-leaf-vulnerability.json'),
        path.join(TEST_DATA_DIR, 'test-package-accepted.json'),
        path.join(TEST_DATA_DIR, 'test-package-lock-accepted.json')
      )

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Threshold: MODERATE')
      expect(result.stdout).toContain('Accepted Risk Packages (filtered out)')
      expect(result.stdout).toContain('pkg-with-accepted-risk@3.2.0')
      expect(result.stdout).toContain('Accepted leaf vulnerabilities: vulnerable-leaf')
      expect(result.stdout).toContain('No vulnerabilities at or above "moderate" threshold')
    })

    it('should reject accepted risk when version is missing from config', async () => {
      const tmpDir = fs.mkdtempSync(path.join(__dirname, 'tmp-'))
      const customPackageJson = {
        name: 'test-no-version',
        version: '1.0.0',
        dependencies: {
          'pkg-with-accepted-risk': '^3.0.0'
        },
        'audit-check': {
          threshold: 'moderate',
          'pkg-with-accepted-risk': {
            'vulnerable-leaf': {}
          }
        }
      }
      fs.writeFileSync(
        path.join(tmpDir, 'package.json'),
        JSON.stringify(customPackageJson, null, 2)
      )
      fs.copyFileSync(
        path.join(TEST_DATA_DIR, 'test-package-lock-accepted.json'),
        path.join(tmpDir, 'package-lock.json')
      )

      const auditData = fs.readFileSync(path.join(TEST_DATA_DIR, 'accepted-leaf-vulnerability.json'), 'utf8')

      const child = spawn('node', [AUDIT_CHECK_SCRIPT], {
        cwd: tmpDir,
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let stdout = ''
      const result = await new Promise((resolve) => {
        child.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        child.on('close', (exitCode) => {
          fs.rmSync(tmpDir, { recursive: true, force: true })
          resolve({ exitCode, stdout })
        })

        child.stdin.write(auditData)
        child.stdin.end()
      })

      expect(result.exitCode).toBe(1)
      expect(result.stdout).toContain('Rejected Risk Packages (version mismatch or missing)')
      expect(result.stdout).toContain('pkg-with-accepted-risk@3.2.0')
      expect(result.stdout).toContain('No version specified in audit-check configuration')
      expect(result.stdout).toContain('Vulnerabilities At/Above Threshold')
    })

    it('should reject accepted risk when version does not match', async () => {
      const tmpDir = fs.mkdtempSync(path.join(__dirname, 'tmp-'))
      const customPackageJson = {
        name: 'test-version-mismatch',
        version: '1.0.0',
        dependencies: {
          'pkg-with-accepted-risk': '^3.0.0'
        },
        'audit-check': {
          threshold: 'moderate',
          'pkg-with-accepted-risk': {
            version: '3.1.0',
            'vulnerable-leaf': {}
          }
        }
      }
      fs.writeFileSync(
        path.join(tmpDir, 'package.json'),
        JSON.stringify(customPackageJson, null, 2)
      )
      fs.copyFileSync(
        path.join(TEST_DATA_DIR, 'test-package-lock-accepted.json'),
        path.join(tmpDir, 'package-lock.json')
      )

      const auditData = fs.readFileSync(path.join(TEST_DATA_DIR, 'accepted-leaf-vulnerability.json'), 'utf8')

      const child = spawn('node', [AUDIT_CHECK_SCRIPT], {
        cwd: tmpDir,
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let stdout = ''
      const result = await new Promise((resolve) => {
        child.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        child.on('close', (exitCode) => {
          fs.rmSync(tmpDir, { recursive: true, force: true })
          resolve({ exitCode, stdout })
        })

        child.stdin.write(auditData)
        child.stdin.end()
      })

      expect(result.exitCode).toBe(1)
      expect(result.stdout).toContain('Rejected Risk Packages (version mismatch or missing)')
      expect(result.stdout).toContain('pkg-with-accepted-risk@3.2.0')
      expect(result.stdout).toContain('Version mismatch (installed: 3.2.0, configured: 3.1.0)')
      expect(result.stdout).toContain('Vulnerabilities At/Above Threshold')
    })
  })
})
