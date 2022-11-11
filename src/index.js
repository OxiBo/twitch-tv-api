import './styles/index.css';

$(document).ready(function () {
  const usersAll = [
    'ESL_SC2',
    'cretetion',
    'be',
    'freecodecamp',
    'storbeck',
    'habathcx',
    'OgamingSC2',
    'RobotCaleb',
    'noobs2ninjas',
    'MOONMOON_OW',
    'Orange_HS',
    'Rainbow6',
    'Ninja',
  ];

  const $clientId = process.env.CLIENT_ID;
  const $clientSecret = process.env.CLIENT_SECRET;
  const $content = $('#content');
  const $lookUp = $('#searchUser');
  const $result = $('#result');
  const $users = $('.users');
  const $usersTemplate = $('#usersTemplate');
  const $onlineButton = '#b478ed';
  const $offlineButton = '#e6d2f9';

  /* function that gets info about twitch TV users performing ajax request*/
  function loadInfo(channels, users) {
    // get twitch api authorization
    const twitchAuthUrl = `https://id.twitch.tv/oauth2/token?client_id=${$clientId}&client_secret=${$clientSecret}&grant_type=client_credentials`;

    $.ajax({
      type: 'POST',
      url: twitchAuthUrl,
      success: function (res) {
        //      console.log(res);
        const { access_token } = res;
        const url = 'https://api.twitch.tv/helix/';

        let ajaxRequestTimeout = setTimeout(function () {
          if (channels == 'one') {
            $result.empty();
            $result.html(
              '<div class="users offline">failed to load information</div>'
            );
          } else {
            $users.remove();
            $result.empty();
            $content.html(
              '<div class="users offline">failed to load information</div>'
            );
          }
        }, 8000);

        const urlParts = users
          .map((user) => `login=${encodeURIComponent(user)}&`)
          .join('');
        $.ajax({
          type: 'GET',
          url: `${url}users?${urlParts}`,
          headers: {
            'Client-ID': $clientId,
            Accept: 'application/vnd.twitchtv.v5+json',
            Authorization: `Bearer ${access_token}`,
          },
          cache: false,
          success: function ({ data }) {
            const twitchCurrentUsers = data;
            // get users ids to create url for the second request
            const secondUrlParts = twitchCurrentUsers
              .map((user) => `user_id=${user.id}&`)
              .join('');

            // second request to api to get information about currently streaming users and names of the streaming programs
            $.ajax({
              url: `${url}streams?${secondUrlParts}`,
              headers: {
                'Client-ID': $clientId,
                Accept: 'application/vnd.twitchtv.v5+json',
                Authorization: `Bearer ${access_token}`,
              },
              cache: false,
              success: function ({ data }) {
                // form array of users which are twitch TV streamers and extract data needed to display results
                const twitchParsedUsers = twitchCurrentUsers.map((user) => {
                  const foundUserFirstCall = data.find((i) => {
                    return i.user_id === user.id;
                  });

                  return {
                    name: user.display_name,
                    urlStream: 'https://www.twitch.tv/' + user.display_name,
                    icon: user.profile_image_url,
                    status: foundUserFirstCall
                      ? foundUserFirstCall.title
                      : 'offline',
                  };
                });
                // create array of all users from the users array with the found
                const result = users.map((user) => {
                  const updatedUser = twitchParsedUsers.find(
                    (i) => user.toLowerCase() === i.name.toLowerCase()
                  );
                  return updatedUser
                    ? updatedUser
                    : {
                        name: user,
                        urlStream: 'https://www.twitch.tv/', // TODO  - display the right thing
                        // urlStream: 'https://thumbsnap.com/i/Rh4aXQqX.png',
                        icon: 'https://thumbsnap.com/i/Rh4aXQqX.png',
                        status: 'not found',
                      };
                });

                //display information about channels on the page
                if (channels == 'one') {
                  $result.html(createHTML(result[0]));
                } else if (channels == 'all') {
                  result.forEach((item) => {
                    $content.append(createHTML(item));
                  });
                } else if (channels == 'online') {
                  const usersOnline = result.filter(
                    (user) =>
                      user.status !== 'offline' && user.status !== 'not found'
                  );
                  usersOnline.forEach((item) =>
                    $content.append(createHTML(item))
                  );
                } else if (channels == 'offline') {
                  const usersOffline = result.filter(
                    (user) =>
                      user.status === 'offline' || user.status === 'not found'
                  );
                  usersOffline.forEach((item) =>
                    $content.append(createHTML(item))
                  );
                }
                // set div background-color to grey if the user is offline
                $('p:contains(offline)').parent().parent().addClass('offline');
                $('p:contains(not found)')
                  .parent()
                  .parent()
                  .addClass('offline');

                clearTimeout(ajaxRequestTimeout);
              },
              error: function (err) {
                console.timeLog(err);
              },
            });
          },
          error: function (err) {
            console.log(err);
          },
        });
      },
      error: function (res) {
        // console.log(res);
        console.log('Unable to get authorization from API');
      },
    });
  }

  //display channels on the page
  function createHTML(data) {
    const rawTemplate = $usersTemplate.html();
    const compiledTemplate = Handlebars.compile(rawTemplate);
    const generatedHTML = compiledTemplate(data);
    return generatedHTML;
  }

  // register helper which checks if user exists, if it does not, html does not render a link to twitchTV
  Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });

  // typeahead implementation
  let substringMatcher = function (strs) {
    return function findMatches(q, cb) {
      console.log('it works');
      let matches, substrRegex;

      // an array that will be populated with substring matches
      matches = [];

      // regex used to determine if a string contains the substring `q`
      substrRegex = new RegExp(q, 'i');

      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(strs, function (i, str) {
        if (substrRegex.test(str)) {
          matches.push(str);
        }
      });

      cb(matches);
    };
  };

  $('#searchForm .typeahead').typeahead(
    {
      hint: false,
      highlight: false,
      minLength: 1,
      cache: false,
    },
    {
      name: 'users',
      source: substringMatcher(usersAll),
    }
  );

  // load channels when page is ready
  loadInfo('all', usersAll);
  $('#all')
    .css('background-color', $onlineButton)
    .siblings()
    .css('background-color', $offlineButton);

  // add event listener - when a button is clicked display respective list of channels
  $('.myButton').on('click', function () {
    $users.remove();
    $content.empty();
    $result.empty();
    $(this)
      .css('background-color', $onlineButton)
      .siblings()
      .css('background-color', $offlineButton);

    loadInfo(this.id, usersAll);
    return false;
  });

  // find a twitch TV user and display information about it
  $('form').on('submit', function () {
    let lookUp = [$lookUp.val()];
    $result.empty();
    loadInfo('one', lookUp);
  });
});
