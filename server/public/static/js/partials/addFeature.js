// eslint-disable-next-line no-unused-vars
window.LTFMGMT.addFeatureHtml = function (featureIndex, type) {
  let featureHTML

  if (type === 'llfa') {
    // Generate HTML for the feature on
    // LLFA reports
    featureHTML = `
      <div id="item_${featureIndex}" class="array-item">
        <div class="form-group field field-object">
          <fieldset id="features_${featureIndex}">
            <div class="form-group field field-object">
              <fieldset id="features_${featureIndex}_properties">
                <legend id="features_${featureIndex}_properties__title">properties</legend>
                <div class="hidden"><input type="hidden" id="features_${featureIndex}_properties_apply" value="llfa"></div>
                <div class="hidden"><input type="hidden" id="features_${featureIndex}_properties_riskOverride" value=""></div>
                <div id="map_${featureIndex}" class="comment-map"></div>
                <div class="form-group field field-string govuk-form-group info">
                  <fieldset class="govuk-fieldset">
                    <legend class="govuk-fieldset__legend govuk-fieldset__legend--s">
                      <label class="control-label govuk-heading-s" for="features_${featureIndex}_properties_report_type">Report</label>
                    </legend>
                    <p id="features_${featureIndex}_properties_info__description" class="govuk-hint">The report text will display to public users in this geometry.</p>
                    <div class="govuk-radios" id="features_${featureIndex}_properties_report_type">
                      <div class="govuk-radios__item">
                        <input class="govuk-radios__input" id="report_flood_${featureIndex}" type="radio" name="features_${featureIndex}_properties_report_type" value="Flood report">
                        <label class="govuk-label govuk-radios__label" for="report_flood_${featureIndex}">Flood report</label>
                      </div>
                      <div class="govuk-radios__item">
                        <input class="govuk-radios__input" id="report_noncompliant_${featureIndex}" type="radio" name="features_${featureIndex}_properties_report_type" value="Non compliant mapping">
                        <label class="govuk-label govuk-radios__label" for="report_noncompliant_${featureIndex}">Non compliant mapping</label>
                      </div>
                      <div class="govuk-radios__item">
                        <input class="govuk-radios__input" id="report_proposed_${featureIndex}" type="radio" name="features_${featureIndex}_properties_report_type" value="Proposed schemes">
                        <label class="govuk-label govuk-radios__label" for="report_proposed_${featureIndex}">Proposed schemes</label>
                      </div>
                      <div class="govuk-radios__item">
                        <input class="govuk-radios__input" id="report_completed_${featureIndex}" type="radio" name="features_${featureIndex}_properties_report_type" value="Completed schemes">
                        <label class="govuk-label govuk-radios__label" for="report_completed_${featureIndex}">Completed schemes</label>
                      </div>
                      <div class="govuk-radios__item">
                        <input class="govuk-radios__input" id="report_action_${featureIndex}" type="radio" name="features_${featureIndex}_properties_report_type" value="Flood action plan">
                        <label class="govuk-label govuk-radios__label" for="report_action_${featureIndex}">Flood action plan</label>
                      </div>
                      <div class="govuk-radios__item">
                        <input class="govuk-radios__input" id="report_other_${featureIndex}" type="radio" name="features_${featureIndex}_properties_report_type" value="Other info">
                        <label class="govuk-label govuk-radios__label" for="report_other_${featureIndex}">Other info</label>
                      </div>
                    </div>
                  </fieldset>
                </div>
                <p class="govuk-heading-s">Add dates</p>
                <p class="govuk-hint">Your LLFA comment will not go live automatically. It will be uploaded once it has been approved.</p>
                <p class="govuk-hint">These dates are for internal use only and will not be displayed publicly.</p>
                <div class="form-group field field-string  govuk-form-group start"><label class="control-label govuk-heading-s"
                    for="features_${featureIndex}_properties_start">Enter the start date<span class="required">*</span></label>
                  <p id="features_${featureIndex}_properties_start__description_llfa" class="field-description govuk-hint">Select the date the LLFA is valid from.</p>
                    <input name="features_${featureIndex}_properties_start" type="date" id="features_${featureIndex}_properties_start" class="govuk-input govuk-input--width-10 start-date"
                    autocomplete="off" required="" value="">
                </div>
                <div class="form-group field field-string  govuk-form-group end"><label class="control-label govuk-heading-s"
                    for="features_${featureIndex}_properties_end">Enter the end date<span class="required">*</span></label>
                  <p id="features_${featureIndex}_properties_end__description_llfa" class="field-description govuk-hint">
                    Select the date the holding comment is valid to. 
                    <strong>You must remove your comment on the end date provided, as this will not happen automatically.</strong>
                  </p>
                  <input name="features_${featureIndex}_properties_end" type="date" id="features_${featureIndex}_properties_end" class="govuk-input govuk-input--width-10 end-date"
                    autocomplete="off" required="" value="">
                </div>
              </fieldset>
            </div>
          </fieldset>
        </div>
      </div>
    `
  } else {
    // Generate HTML for the feature on
    // holding comments
    featureHTML = `
      <div id="item_${featureIndex}" class="array-item">
        <div class="form-group field field-object">
          <fieldset id="features_${featureIndex}">
            <div class="form-group field field-object">
              <fieldset id="features_${featureIndex}_properties">
                <legend id="features_${featureIndex}_properties__title">properties</legend>
                <div class="hidden">
                  <input type="hidden" id="features_${featureIndex}_properties_apply" value="holding">
                </div>
                <div class="comment-map"></div>
                <div class="form-group field field-string govuk-form-group riskOverride">
                  <fieldset class="govuk-fieldset">
                  <legend class="govuk-fieldset__legend govuk-fieldset__legend--s">
                    <label class="control-label govuk-heading-s" for="features_${featureIndex}_properties_risk_type">What flood risk do you want to update?</label>
                  </legend>
                  <p class="govuk-hint">Select the flood risk type that you want to update for the points inside your selected area.</p>
                  <div class="govuk-radios" id="features_${featureIndex}_properties_risk_type">
                    <div class="govuk-radios__item">
                    <input class="govuk-radios__input" id="sw_${featureIndex}" type="radio" name="sw_or_rs_${featureIndex}" value="Surface water" checked>
                    <label class="govuk-label govuk-radios__label" for="sw_${featureIndex}">Surface water</label>
                    </div>
                    <div class="govuk-radios__item">
                    <input class="govuk-radios__input" id="rs_${featureIndex}" type="radio" name="sw_or_rs_${featureIndex}" value="Rivers and the sea">
                    <label class="govuk-label govuk-radios__label" for="rs_${featureIndex}">Rivers and the sea</label>
                    </div>
                  </div>
                  </fieldset>
                </div>

                <!-- Surface water override -->
                <div id="risk-override-radios_${featureIndex}" class="form-group field field-string govuk-form-group riskOverride">
                  <label class="control-label govuk-heading-s" for="features_${featureIndex}_properties_riskOverride">
                    Do you want to override the present day surface water flood risk rating?
                  </label>
                  <p class="govuk-hint">If you select yes, the risk you select here will override the <strong>present day</strong> risk on the live service.</p>
                  <div class="govuk-radios" id="features_${featureIndex}_properties_riskOverride">
                    <div class="govuk-radios__item">
                      <input class="govuk-radios__input" id="map_${featureIndex}-no-override" type="radio" name="override_${featureIndex}-risk" value="Do not override" checked>
                      <label class="govuk-label govuk-radios__label" for="map_${featureIndex}-no-override">No, do not override</label>
                    </div>
                    <div class="govuk-radios__item">
                      <input class="govuk-radios__input" id="map_${featureIndex}-override" type="radio" name="override_${featureIndex}" value="Override">
                      <label class="govuk-label govuk-radios__label" for="map_${featureIndex}-override">Yes, override surface water</label>
                    </div>
                    <div id="risk-override-warning_${featureIndex}" class="govuk-warning-text risk-selection-indent hide">
                      <span class="govuk-warning-text__icon" aria-hidden="true">!</span>
                      <strong class="govuk-warning-text__text">
                      <span class="govuk-visually-hidden">Warning</span>
                      By overriding the present day risk rating, climate change information will automatically show as 'no data available'. 
                      Any surface water depth information will also be removed from the service and replaced with 'no data available'.
                      </strong>
                    </div>
                    <div id="risk-options_${featureIndex}" class="govuk-radios risk-selection-indent hide">
                      <div class="govuk-radios__item">
                        <input class="govuk-radios__input" id="risk_very_low_${featureIndex}" type="radio" name="override_${featureIndex}-risk" value="Very low">
                        <label class="govuk-label govuk-radios__label" for="risk_very_low_${featureIndex}">Very low</label>
                      </div>
                      <div class="govuk-radios__item">
                        <input class="govuk-radios__input" id="risk_low_${featureIndex}" type="radio" name="override_${featureIndex}-risk" value="Low">
                        <label class="govuk-label govuk-radios__label" for="risk_low_${featureIndex}">Low</label>
                      </div>
                      <div class="govuk-radios__item">
                        <input class="govuk-radios__input" id="risk_medium_${featureIndex}" type="radio" name="override_${featureIndex}-risk" value="Medium">
                        <label class="govuk-label govuk-radios__label" for="risk_medium_${featureIndex}">Medium</label>
                      </div>
                      <div class="govuk-radios__item">
                        <input class="govuk-radios__input" id="risk_high_${featureIndex}" type="radio" name="override_${featureIndex}-risk" value="High">
                        <label class="govuk-label govuk-radios__label" for="risk_high_${featureIndex}">High</label>
                      </div>
                    </div>
                  </div>
                </div>
     
                <!-- Surface water climate change override -->
                <div id="risk-override-radios_${featureIndex}_cc" class="form-group field field-string govuk-form-group riskOverride hide">
                  <label class="control-label govuk-heading-s" for="features_${featureIndex}_properties_riskOverride_cc">
                    Do you want to override the climate change surface water flood risk rating?
                  </label>
                  <p class="govuk-hint">If you select yes, the <strong>climate change</strong> data will display as 'no data available' on the live service.</p>
                  <div class="govuk-radios" id="features_${featureIndex}_properties_riskOverride_cc">
                    <div class="govuk-radios__item">
                      <input class="govuk-radios__input" id="map_${featureIndex}-no-override_cc" type="radio" name="override_${featureIndex}-risk_cc" value="Do not override" checked>
                      <label class="govuk-label govuk-radios__label" for="map_${featureIndex}-no-override_cc">No, do not override</label>
                    </div>
                    <div class="govuk-radios__item">
                      <input class="govuk-radios__input" id="map_${featureIndex}-override_cc" type="radio" name="override_${featureIndex}-risk_cc" value="Override">
                      <label class="govuk-label govuk-radios__label" for="map_${featureIndex}-override_cc">Yes, override to show 'no data available'</label>
                    </div>
                  </div>
                  <div id="risk-override-warning_${featureIndex}_cc" class="govuk-warning-text risk-selection-indent hide">
                    <span class="govuk-warning-text__icon" aria-hidden="true">!</span>
                    <strong class="govuk-warning-text__text">
                      <span class="govuk-visually-hidden">Warning</span>
                      By overriding the climate change risk rating, climate change information will now show as 'no data available'.
                      Any surface water depth information will also be removed from the service and replaced with 'no data available'.
                    </strong>
                  </div>
                </div>

                <!-- Rivers and the sea override -->
                <div id="risk-override-radios_${featureIndex}_rs" class="form-group field field-string govuk-form-group riskOverride">
                  <label class="control-label govuk-heading-s" for="features_${featureIndex}_properties_riskOverride_rs">
                    Do you want to override the present day rivers and the sea flood risk rating?
                  </label>
                  <p class="govuk-hint">If you select yes, the risk you select here will override the <strong>present day</strong> risk on the live service.</p>
                  <div class="govuk-radios" id="features_${featureIndex}_properties_riskOverride_rs">
                    <div class="govuk-radios__item">
                      <input class="govuk-radios__input" id="map_${featureIndex}-no-override_rs" type="radio" name="override_${featureIndex}-risk_rs" value="Do not override" checked>
                      <label class="govuk-label govuk-radios__label" for="map_${featureIndex}-no-override_rs">No, do not override</label>
                    </div>
                    <div class="govuk-radios__item">
                      <input class="govuk-radios__input" id="map_${featureIndex}-override_rs" type="radio" name="override_${featureIndex}_rs" value="Override">
                      <label class="govuk-label govuk-radios__label" for="map_${featureIndex}-override_rs">Yes, override rivers and the sea</label>
                    </div>
                    <div id="risk-override-warning_${featureIndex}_rs" class="govuk-warning-text risk-selection-indent hide">
                      <span class="govuk-warning-text__icon" aria-hidden="true">!</span>
                      <strong class="govuk-warning-text__text">
                        <span class="govuk-visually-hidden">Warning</span>
                        By overriding the present day risk rating, climate change information will automatically show as 'no data available'.
                        Any rivers and the sea depth information will also be removed from the service and replaced with 'no data available'.
                      </strong>
                    </div>
                    <div id="risk-options_${featureIndex}_rs" class="govuk-radios risk-selection-indent hide">
                      <div class="govuk-radios__item">
                        <input class="govuk-radios__input" id="risk_very_low_${featureIndex}_rs" type="radio" name="override_${featureIndex}-risk_rs" value="Very low">
                        <label class="govuk-label govuk-radios__label" for="risk_very_low_${featureIndex}_rs">Very low</label>
                      </div>
                      <div class="govuk-radios__item">
                        <input class="govuk-radios__input" id="risk_low_${featureIndex}_rs" type="radio" name="override_${featureIndex}-risk_rs" value="Low">
                        <label class="govuk-label govuk-radios__label" for="risk_low_${featureIndex}_rs">Low</label>
                      </div>
                      <div class="govuk-radios__item">
                        <input class="govuk-radios__input" id="risk_medium_${featureIndex}_rs" type="radio" name="override_${featureIndex}-risk_rs" value="Medium">
                        <label class="govuk-label govuk-radios__label" for="risk_medium_${featureIndex}_rs">Medium</label>
                      </div>
                      <div class="govuk-radios__item">
                        <input class="govuk-radios__input" id="risk_high_${featureIndex}_rs" type="radio" name="override_${featureIndex}-risk_rs" value="High">
                        <label class="govuk-label govuk-radios__label" for="risk_high_${featureIndex}_rs">High</label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Rivers and the sea climate change override -->
                <div id="risk-override-radios_${featureIndex}_rscc" class="form-group field field-string govuk-form-group riskOverride hide">
                  <label class="control-label govuk-heading-s" for="features_${featureIndex}_properties_riskOverride_rscc">
                    Do you want to override the climate change rivers and the sea flood risk rating?
                  </label>
                  <p class="govuk-hint">If you select yes, the <strong>climate change</strong> data will display as 'no data available' on the live service.</p>
                  <div class="govuk-radios" id="features_${featureIndex}_properties_riskOverride_rscc">
                    <div class="govuk-radios__item">
                      <input class="govuk-radios__input" id="map_${featureIndex}-no-override_rscc" type="radio" name="override_${featureIndex}-risk_rscc" value="Do not override" checked>
                      <label class="govuk-label govuk-radios__label" for="map_${featureIndex}-no-override_rscc">No, do not override</label>
                    </div>
                    <div class="govuk-radios__item">
                      <input class="govuk-radios__input" id="map_${featureIndex}-override_rscc" type="radio" name="override_${featureIndex}-risk_rscc" value="Override">
                      <label class="govuk-label govuk-radios__label" for="map_${featureIndex}-override_rscc">Yes, override to show 'no data available'</label>
                    </div>
                  </div>
                  <div id="risk-override-warning_${featureIndex}_rscc" class="govuk-warning-text risk-selection-indent hide">
                    <span class="govuk-warning-text__icon" aria-hidden="true">!</span>
                    <strong class="govuk-warning-text__text">
                      <span class="govuk-visually-hidden">Warning</span>
                      By overriding the climate change risk rating, climate change information will now show as 'no data available'.
                      Any rivers and the sea depth information will also be removed from the service and replaced with 'no data available'.
                    </strong>
                  </div>
                </div>

                <div class="form-group field field-string govuk-form-group">
                  <label
                    class="control-label govuk-heading-s" for="features_${featureIndex}_properties_add_comment">
                    Do you want to add holding comment text?
                  </label>
                  <p class="govuk-body">The holding comment text will display to public users in this area. 
                    Read <a href="/comment-guidance" target="_blank" previewlistener="true">comment guidance</a>
                    before writing or pasting anything. The maximum number of characters is 180.</p>
                  <details class="govuk-details">
                    <summary class="govuk-details__summary">
                      <span class="govuk-details__summary-text">
                        Examples of holding comment text
                      </span>
                    </summary>
                    <div class="govuk-details__text">
                      <div id="features_${featureIndex}_properties_info__description" class="field-description">
                        <p>For updates to when NaFRA2 data will be available: Some of the rivers and sea flood risk data for this location is 
                          currently unavailable. We'll publish this data by [month]</p>
                        <p>For other scenarios (new modelling): We will update this data to include new rivers and sea information for this area. 
                          For information, email <a href="mailto:enquiries@environment-agency.gov.uk">enquiries@environment-agency.gov.uk</a></p>
                        <p>For flood alleviation schemes: A flood management scheme in [Weston-Super-Mare] has been completed. We will include this 
                          in our rivers and sea data. For information, email 
                          <a href="mailto:enquiries@environment-agency.gov.uk">enquiries@environment-agency.gov.uk</a></p>
                        <p>Data currently being reviewed: We are reviewing rivers and sea data for this area. For information, contact 
                          <a href="mailto:enquiries@environment-agency.gov.uk">enquiries@environment-agency.gov.uk</a></p>
                      </div>
                    </div>
                  </details>
                  <div class="govuk-radios" id="features_${featureIndex}_properties_add_comment">
                    <div class="govuk-radios__item">
                      <input class="govuk-radios__input" id="text_no_${featureIndex}" type="radio" name="add_holding_comment_${featureIndex}" value="No">
                      <label class="govuk-label govuk-radios__label" for="text_no_${featureIndex}">No, do not add a holding comment text</label>
                    </div>
                    <div class="govuk-radios__item">
                      <input class="govuk-radios__input" id="text_yes_${featureIndex}" type="radio" name="add_holding_comment_${featureIndex}" value="Yes" checked>
                      <label class="govuk-label govuk-radios__label" for="text_yes_${featureIndex}">Yes, add holding comment text</label>
                    </div>
                  </div>
                </div>
                <div class="form-group field field-string  govuk-form-group info" id="text_area_${featureIndex}">
                  <div>
                    <textarea name="features_${featureIndex}_properties_info" rows="5" id="features_${featureIndex}_properties_info" maxlength="180" class="govuk-textarea"></textarea>
                    <p class="govuk-hint govuk-character-count__message">You have <span class="remaining-chars-text"></span> characters remaining</p>
                  </div>
                </div>

                <p class="govuk-heading-s">Add dates</p>
                <p class="govuk-hint">Your holding comment will not go live automatically. It will be uploaded once it has been approved.</p>
                <p class="govuk-hint">These dates are for internal use only and will not be displayed publicly.</p>
                <div class="form-group field field-string  govuk-form-group start">
                  <label class="control-label govuk-heading-s" for="features_${featureIndex}_properties_start">Enter the start date<span class="required">*</span></label>
                  <p id="features_${featureIndex}_properties_start__description" class="field-description govuk-hint">
                    Select the date the holding comment is valid from.
                  </p>
                  <input name="features_${featureIndex}_properties_start" type="date" id="features_${featureIndex}_properties_start" class="start-date govuk-input govuk-input--width-10" autocomplete="off" required="">
                </div>
                <div class="form-group field field-string  govuk-form-group end">
                  <label class="control-label govuk-heading-s" for="features_${featureIndex}_properties_end">Enter the end date<span class="required">*</span></label>
                  <p id="features_${featureIndex}_properties_end__description" class="field-description govuk-hint">
                    Select the date the holding comment is valid to. 
                    <strong>You must remove your comment on the end date provided, as this will not happen automatically.</strong>
                  </p>
                  <input name="features_${featureIndex}_properties_end" type="date" id="features_${featureIndex}_properties_end" class="end-date govuk-input govuk-input--width-10" autocomplete="off" required="">
                </div>
              </fieldset>
            </div>
          </fieldset>
        </div>
      </div>
    `
  }

  // Append the HTML to the container element
  return featureHTML
}
