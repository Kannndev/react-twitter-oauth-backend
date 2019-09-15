const passport = require('passport'),
  express = require('express'),
  router = express.Router(),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  twitterManger = require('./twitter.manager');

const passportConfig = require('./passport');

passportConfig();

const app = express();

// enable cors
const corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};

app.use(cors(corsOption));

//rest API requirements
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

router.route('/auth/twitter/reverse').post(twitterManger.request_token);

router.route('/auth/twitter').post(twitterManger.oauthVerifier,
  passport.authenticate('twitter-token', { session: false }), twitterManger.setApiToken,
  twitterManger.generateToken, twitterManger.sendToken);

router.route('/getUserDetails/:screenName').get(twitterManger.getUserDetails);

router.route('/getFollwersList/:screenName').get(twitterManger.getFollowersList);

app.use('/api/v1', router);

app.listen(4000);
module.exports = app;
console.log('Server running at http://localhost:4000/');
