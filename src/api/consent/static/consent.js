function checkConsent() {
  if (hasConsented()) {
    $('#btn_consent').removeAttr('disabled');
  } else {
    $('#btn_consent').attr('disabled', 'disabled')
  }
}

function hasConsented() {
    return $('#chk_consent:checked').length > 0;
}

$(document).ready(function() {
  $('#chk_consent').change(checkConsent);
});
