# Audit Check Script

A configurable npm audit checker that allows setting severity thresholds and accepting known risks.

## Features

- **Configurable Severity Threshold**: Only fail on vulnerabilities at or above a specified severity level
- **Clear Reporting**: Separate display of above-threshold, below-threshold, and accepted risk vulnerabilities
- **Dependency Tree Visualization**: ASCII tree showing the complete vulnerability chain
- **Exit Code Control**: Returns 0 for pass, 1 for fail based on threshold

## Usage

```bash
npm audit --omit dev --json | node bin/audit-check
```

Or save and pipe:
```bash
npm audit --json > audit.json && node bin/audit-check < audit.json
```

## Configuration

Configure in your `package.json` under the `audit-check` section:

```json
{
  "audit-check": {
    "threshold": "moderate",
    "direct-package-name": {
      "leaf-vulnerable-package": {}
    }
  }
}
```

### Severity Levels

Available thresholds (in ascending order):
- `info`
- `low`
- `moderate` (default)
- `high`
- `critical`

### Example Configuration

Accept specific leaf vulnerabilities in direct dependencies:

```json
{
  "audit-check": {
    "threshold": "high",
    "ogr2ogr": {
      "minimatch": {}
    },
    "another-package": {
      "lodash": {},
      "axios": {}
    }
  }
}
```

In this example:
- The threshold is set to `high`, so only high and critical vulnerabilities will cause failures
- For the `ogr2ogr` package, vulnerabilities that originate from `minimatch` (as a leaf vulnerability) will be accepted
- For `another-package`, vulnerabilities from both `lodash` and `axios` will be accepted

The script identifies the actual vulnerable package (leaf node) from the dependency chain and checks if that specific vulnerability has been accepted in the direct package's configuration.

## Behavior

### Exit Codes
- **0**: No vulnerabilities at or above threshold (pass)
- **1**: Vulnerabilities found at or above threshold (fail)

### Reporting Sections

1. **Accepted Risk Packages**: 
   - Lists direct dependencies with accepted vulnerabilities
   - Shows which leaf vulnerabilities (actual vulnerable packages) were accepted
   - Example: `✓ ogr2ogr@6.0.1` with `Accepted leaf vulnerabilities: minimatch`
2. **Below Threshold Vulnerabilities**: Vulnerabilities below the severity threshold (informational)
3. **Vulnerabilities At/Above Threshold**: Vulnerabilities that cause failure

### Example Output

```
═══════════════════════════════════════════════════════════
  Audit Check - Threshold: MODERATE
═══════════════════════════════════════════════════════════

Accepted Risk Packages (filtered out):
  ✓ ogr2ogr@6.0.1
    Accepted leaf vulnerabilities: minimatch

───────────────────────────────────────────────────────────
  Below Threshold Vulnerabilities (informational)
───────────────────────────────────────────────────────────

📦 Package: some-package@1.2.3
ℹ️  Severity: LOW (below threshold)
   Range: >=1.0.0
   Fix: some-package@0.9.0

   Dependency Chain:
   └── vulnerable-dep
       └── actual-vuln [low] - Description
           URL: https://github.com/advisories/...

✓ No vulnerabilities at or above "moderate" threshold
```

## Testing

Run the test suite:
```bash
npx jest test/audit-check/audit-check.test.js
```

Tests cover:
- No vulnerabilities
- Below threshold (informational)
- Above threshold (failure)
- Mixed severity levels
- Accepted risk filtering
- Custom threshold configurations

## How It Works

1. Reads `package.json` for threshold and accepted risk configuration
2. Reads `package-lock.json` to determine installed package versions
3. Processes npm audit JSON output via stdin
4. Filters direct dependencies only (`isDirect: true`)
5. Separates vulnerabilities by threshold
6. Reports all findings with appropriate exit code
