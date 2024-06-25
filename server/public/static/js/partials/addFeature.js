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
                <div class="form-group field field-string  govuk-form-group info"><label class="control-label"
                    for="features_${featureIndex}_properties_info">Report</label>
                  <p id="features_${featureIndex}_properties_info__description" class="field-description">The report text will display
                    to public users in this geometry.</p>
                  <div class="field-radio-group" id="features_${featureIndex}_properties_info">
                    <div class="radio "><label><input type="radio" name="features_${featureIndex}_properties_report_type" value="Flood report">Flood report</label></div>
                    <div class="radio "><label><input type="radio" name="features_${featureIndex}_properties_report_type" value="Non compliant mapping">Non compliant mapping</label></div>
                    <div class="radio "><label><input type="radio" name="features_${featureIndex}_properties_report_type" value="Proposed schemes">Proposed schemes</label></div>
                    <div class="radio "><label><input type="radio" name="features_${featureIndex}_properties_report_type" value="Completed schemes">Completed schemes</label></div>
                    <div class="radio "><label><input type="radio" name="features_${featureIndex}_properties_report_type" value="Flood action plan">Flood action plan</label></div>
                    <div class="radio "><label><input type="radio" name="features_${featureIndex}_properties_report_type" value="Other info">Other info</label></div>
                  </div>
                </div>
                <div class="form-group field field-string  govuk-form-group start"><label class="control-label"
                    for="features_${featureIndex}_properties_start">Enter the start date<span class="required">*</span></label>
                  <p id="features_${featureIndex}_properties_start__description" class="field-description">Select the date the holding comment is valid from. 
                  Your holding comment will not go live automatically - it’ll be uploaded after it’s approved. 
                  For internal use only - the date will not be displayed to public users.</p>
                    <input name="features_${featureIndex}_properties_start" type="date" id="features_${featureIndex}_properties_start" class="govuk-input govuk-input--width-20 start-date"
                    autocomplete="off" required="" value="">
                </div>
                <div class="form-group field field-string  govuk-form-group end"><label class="control-label"
                    for="features_${featureIndex}_properties_end">Enter the end date<span class="required">*</span></label>
                  <p id="features_${featureIndex}_properties_end__description" class="field-description">Select the date the holding comment is valid to. 
                  You must remove your holding comment on the end date - it will not be removed automatically. 
                  For internal use only - the date will not be displayed to public users.
                  </p>
                  <input name="features_${featureIndex}_properties_end" type="date" id="features_${featureIndex}_properties_end" class="govuk-input govuk-input--width-20 end-date"
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
                <div class="form-group field field-string  govuk-form-group riskOverride">
                  <label
                    class="control-label" for="features_${featureIndex}_properties_risk_type">
                    Select the flood risk you want to update for points inside this area
                  </label>
                  <ul class="field-radio-group" id="features_${featureIndex}_properties_risk_type">
                    <li>
                      <label for="sw_${featureIndex}"><input class="radio" id="sw_${featureIndex}" type="radio" name="sw_or_rs_${featureIndex}"
                        value="Surface water" checked>Surface water</label></li>
                    <li>
                      <label for="rs_${featureIndex}"><input class="radio" type="radio" id="rs_${featureIndex}" name="sw_or_rs_${featureIndex}"
                      value="Rivers and the sea">Rivers and the sea</label></li>
                  </ul>
                </div>
                <div id="risk-override-radios_${featureIndex}" class="form-group field field-string govuk-form-group riskOverride">
                  <label class="control-label" for="features_${featureIndex}_properties_riskOverride">
                  Do you want to override the flood risk rating?'
                  </label>
                  <ul class="field-radio-group" id="features_${featureIndex}_properties_riskOverride">
                    <li class="radio "><label><input id="map_${featureIndex}-no-override" type="radio" name="override_${featureIndex}-risk" value="Do not override" checked >No, do not override</label></li>
                    <li class="radio "><label><input id="map_${featureIndex}-override" type="radio" name="override_${featureIndex}" value="Override">Yes, override surface water</label></li>
                    <ul id="risk-options_${featureIndex}" class="risk-option-radios" style="display: none">
                      <li class="radio "><label><input type="radio" name="override_${featureIndex}-risk" value="Very low">Very low</label></li>
                      <li class="radio "><label><input type="radio" name="override_${featureIndex}-risk" value="Low">Low</label></li>
                      <li class="radio "><label><input type="radio" name="override_${featureIndex}-risk" value="Medium">Medium</label></li>
                      <li class="radio "><label><input type="radio" name="override_${featureIndex}-risk" value="High">High</label></li>
                    </ul>
                  </ul>
                  </div>
                  <div class="form-group field field-string  govuk-form-group">
                    <label
                      class="control-label" for="features_${featureIndex}_properties_add_comment">
                      Do you want to add holding comment text?
                    </label>
                    <ul class="field-radio-group" id="features_${featureIndex}_properties_add_comment">
                      <li>
                        <label for="text_no_${featureIndex}"><input class="radio" id="text_no_${featureIndex}" type="radio" name="add_holding_comment_${featureIndex}"
                          value="No">No, do not add a holding comment text</label></li>
                      <li>
                        <label for="text_yes_${featureIndex}"><input class="radio" type="radio" id="text_yes_${featureIndex}" name="add_holding_comment_${featureIndex}"
                        value="Yes" checked>Yes, add holding comment text</label></li>
                    </ul>
                  </div>
                <div class="form-group field field-string  govuk-form-group info" id="text_area_${featureIndex}">
                  <label class="control-label" for="features_${featureIndex}_properties_info">Enter the holding comment text</label>
                  <div id="features_${featureIndex}_properties_info__description" class="field-description">
                    <p>For example: “The rivers and sea flood risk for this area has changed. For more information, email <a href="mailto:enquiries@environment-agency.gov.uk">enquiries@environment-agency.gov.uk</a>.”</p>
                    <p>The holding comment text will display to public users in this area. Read <a href="/comment-guidance" target="_blank" previewlistener="true">comment guidance</a> before writing or pasting anything. The maximum number of characters is 150.</p>
                  </div>
                  <div>
                    <textarea name="features_${featureIndex}_properties_info" rows="5" id="features_${featureIndex}_properties_info" maxlength="150" class="govuk-textarea"></textarea>
                    <p class="govuk-hint govuk-character-count__message">You have <span class="remaining-chars-text"></span> characters remaining</p>
                  </div>
                </div>
                <div class="form-group field field-string  govuk-form-group start">
                  <label class="control-label" for="features_${featureIndex}_properties_start">Enter the start date<span class="required">*</span></label>
                  <p id="features_${featureIndex}_properties_start__description" class="field-description">
                    Select the date the holding comment is valid from. 
                    Your holding comment will not go live automatically - it’ll be uploaded after it’s approved. 
                    For internal use only - the date will not be displayed to public users.
                  </p>
                  <input name="features_${featureIndex}_properties_start" type="date" id="features_${featureIndex}_properties_start" class="start-date govuk-input govuk-input--width-20" autocomplete="off" required="">
                </div>
                <div class="form-group field field-string  govuk-form-group end">
                  <label class="control-label" for="features_${featureIndex}_properties_end">Enter the end date<span class="required">*</span></label>
                  <p id="features_${featureIndex}_properties_end__description" class="field-description">
                    Select the date the holding comment is valid to. 
                    You must remove your holding comment on the end date - it will not be removed automatically. 
                    For internal use only - the date will not be displayed to public users.
                  </p>
                  <input name="features_${featureIndex}_properties_end" type="date" id="features_${featureIndex}_properties_end" class="end-date govuk-input govuk-input--width-20" autocomplete="off" required="">
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
