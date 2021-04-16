import {
  registerSpecificState,
  successToast,
  errorToast, infoToast,
} from './base.js';


/** Update the lights state.
 * @param {Object} state an object containing all state information */
function updateState(state) {
  if (!('lights' in state)) {
    // this state is not meant for a lights update
    return;
  }

  for (const key in state.lights) {
    if (!state.lights.hasOwnProperty(key)) {
      continue;
    }
    const value = state.lights[key];
    const element = $('#' + key );
    if (element.is(':checkbox')) {
      element.prop('checked', value);
    } else if (element.is('input')) {
      element.val(value);
    } else if (element.is('select')) {
      element.val(value);
    }
  }

  for (const leds of ['ring', 'wled', 'strip', 'screen']) {
    if (state.lights[leds + '_connected']) {
      $('#' + leds + '_options').removeClass('disabled');
      $('#' + leds + '_options .list_item').show();
    } else {
      $('#' + leds + '_options').addClass('disabled');
      $('#' + leds + '_options .list_item').hide();
    }
  }
}

/** Register input handlers. */
export function onReady() {
  if (!window.location.pathname.endsWith('lights/')) {
    return;
  }
  registerSpecificState(updateState);

  /** Post the given data to the given url
   * @param {string} url the endpoint for the post
   * @param {function=} prePost a function that is called before the request.
   *                           needs to return the data that is transferred. */
  function post(url, prePost = () => {
    return {};
  }) {
    const data = prePost();
    $.post(url, data).done(function(response) {
      successToast(response);
    }).fail(function(response) {
      errorToast(response.responseText);
    });
    infoToast('');
  }

  for (const key in urls['lights']) {
    if (!urls['lights'].hasOwnProperty(key)) {
      continue;
    }
    const url = urls['lights'][key];

    // all set_x urls post some data and show a toast with the result.
    // most of them are inputs or checkboxes with a simple 'value' field.
    // add this behavior to each of these elements
    console.log(url);
    if (key.startsWith('set_')) {
      const id = key.substr('set_'.length);
      const element = $('#' + id);
      element.change(function() {
        let prePost;
        if (element.is(':checkbox')) {
          prePost = () => {
            return {value: element.is(':checked')};
          };
        } else if (element.is('input')) {
          prePost = () => {
            return {value: element.val()};
          };
        } else if (element.is('select')) {
          prePost = () => {
            const selected = $('#' + id + ' option:selected').val();
            return {value: selected};
          };
        }
        post(url, prePost);
      });
    }
  }

  $('#adjust_screen').on('click tap', function() {
    post(urls['lights']['adjust_screen']);
  });
}

$(document).ready(onReady);
