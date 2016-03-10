const RiskStatus = {
  AtRisk: 1,
  AtRiskMonitor: 2,
  LowRisk: 3,
  VeryLowRisk: 4
}

const RiskLevel = {
  VeryLow: 'Very Low',
  Low: 'Low',
  Medium: 'Medium',
  High: 'High'
}

function RiskViewModel (risk, address) {
  var inTargetArea = risk.inFloodWarningArea || risk.inFloodAlertArea
  var riverAndSeaRisk = risk.riverAndSeaRisk ? risk.riverAndSeaRisk.probabilityForBand : RiskLevel.VeryLow
  var surfaceWaterRisk = risk.surfaceWaterRisk || RiskLevel.VeryLow

  if (inTargetArea) {
    this.status = RiskStatus.AtRisk
  } else {
    if ((riverAndSeaRisk === RiskLevel.High || riverAndSeaRisk === RiskLevel.Medium) ||
        (surfaceWaterRisk === RiskLevel.High || surfaceWaterRisk === RiskLevel.Medium)) {
      this.status = RiskStatus.AtRiskMonitor
    } else {
      if (riverAndSeaRisk === RiskLevel.VeryLow && surfaceWaterRisk === RiskLevel.VeryLow) {
        this.status = RiskStatus.VeryLowRisk
      } else {
        this.status = RiskStatus.LowRisk
      }
    }
  }

  this.isAtRisk = this.status === RiskStatus.AtRisk
  this.isAtRiskMonitor = this.status === RiskStatus.AtRiskMonitor
  this.isLowRisk = this.status === RiskStatus.LowRisk
  this.isVeryLowRisk = this.status === RiskStatus.VeryLowRisk
  this.isRisk = this.isAtRisk || this.isAtRiskMonitor

  this.easting = address.easting
  this.northing = address.northing
  this.postcode = address.postcode
  this.lines = address.fullAddress.split(', ')
  this.address = address._id
  this.className = this.isRisk ? 'at-risk' : 'low-risk'
  this.date = Date.now()
}

module.exports = RiskViewModel
