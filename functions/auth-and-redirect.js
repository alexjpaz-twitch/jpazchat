const fetch = require('node-fetch');

const {
  TWITCH_CLIENT_ID,
  TWITCH_SECRET_ID,
  TWITCH_REFRESH_TOKEN,
  APP_TOKEN
} = process.env

const refreshAccessToken = async () => {
  const rsp = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams({
        'grant_type': 'refresh_token',
        'client_id': TWITCH_CLIENT_ID,
        'client_secret': TWITCH_SECRET_ID,
        'refresh_token': TWITCH_REFRESH_TOKEN,
      })
    }).then(r => r.json())
  ;

  console.log(rsp)
  return rsp.access_token;
};

exports.handler = async function (event, context) {
  if(event.queryStringParameters.app_token !== APP_TOKEN) {
    return {
      statusCode: 403,
      body: "Invalid app_token"
    };
  }

  const access_token = await refreshAccessToken();

  const targets = {
    "trivia": "https://dhttm9zkbfvzw.cloudfront.net/alexjpaz-twitch/deployments/trivia/#/background?channel=alexjpaz&token={access_token}",
    "litty": "https://loving-lovelace-0225ae.netlify.app/?channel=alexjpaz&token={access_token}",
    "alerts": "https://dhttm9zkbfvzw.cloudfront.net/alexjpaz-twitch/alerts/?channel=alexjpaz&token={access_token}",
  };

  const target = targets[event.queryStringParameters.target];

  const redirect_url = target.replace("{access_token}", access_token);;

  return {
    statusCode: 200,
    headers: {
      'Cache-Control': 'max-age=21600'
    },
    body: `
      <script>location.assign("${redirect_url}")</script>
    `
  };
};

