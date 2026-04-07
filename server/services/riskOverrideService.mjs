/**
 * Service for handling risk override logic
 * Consolidates risk override calculations used across the application
 */

/**
 * Get risk override values for display purposes (used in comment view)
 * @param {Object} properties - Feature properties
 * @param {string} doNotOverride - Default value when no override is set
 * @returns {Object} Object with presentDay and climateChange values
 */
export function getRiskOverrideValues (properties, doNotOverride = 'Do not override') {
  let presentDay = properties.riskOverride ?? properties.riskOverrideRS
  if (presentDay === null || presentDay === undefined) {
    presentDay = doNotOverride
  }

  let climateChange = properties.riskOverrideCc ?? properties.riskOverrideRSCC
  if (climateChange === null || climateChange === undefined) {
    climateChange = doNotOverride
  }

  if ((presentDay && presentDay !== doNotOverride) || climateChange === 'Override') {
    climateChange = 'No data available'
  }

  return { presentDay, climateChange }
}

/**
 * Get risk override values for CSV export
 * @param {Object} comment - The comment object
 * @param {string} riskType - The risk type ('Surface water' or 'Rivers and the sea')
 * @param {Object} properties - Feature properties
 * @returns {Object} Object with riskOverridePresentDay and riskOverrideClimateChange values
 */
export function getRiskOverridesForExport (comment, riskType, properties) {
  const {
    riskOverride,
    riskOverrideCc,
    riskOverrideRS,
    riskOverrideRSCC
  } = properties

  const notApplicable = {
    riskOverridePresentDay: 'Not applicable',
    riskOverrideClimateChange: 'Not applicable'
  }

  if (comment.type !== 'holding') {
    return notApplicable
  }

  const getOverrides = (presentDayOverride, climateChangeOverride) => {
    const presentDay = presentDayOverride || ''
    const climateChange = presentDay && presentDay !== 'Do not override'
      ? 'Override'
      : climateChangeOverride || ''
    return {
      riskOverridePresentDay: presentDay,
      riskOverrideClimateChange: climateChange
    }
  }

  switch (riskType) {
    case 'Surface water':
      return getOverrides(riskOverride, riskOverrideCc)
    case 'Rivers and the sea':
      return getOverrides(riskOverrideRS, riskOverrideRSCC)
    default:
      return notApplicable
  }
}
