const request = require('request-promise'),
    twitterConfig = require('./twitter.config.js'),
    jwt = require('jsonwebtoken')

const oauthVerifier = async (req, res, next) => {
    try {
        const body = await request.post({
            url: `https://api.twitter.com/oauth/access_token?oauth_verifier`,
            oauth: {
                consumer_key: twitterConfig.consumerKey,
                consumer_secret: twitterConfig.consumerSecret,
                token: req.query.oauth_token
            },
            form: { oauth_verifier: req.query.oauth_verifier }
        });
        const bodyString = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
        const parsedBody = JSON.parse(bodyString);

        req.body['oauth_token'] = parsedBody.oauth_token;
        req.body['oauth_token_secret'] = parsedBody.oauth_token_secret;
        req.body['user_id'] = parsedBody.user_id;
        next();
    } catch (err) {
        return res.send(500, { message: err.message });
    }
}

const request_token = async function (req, res) {
    try {
        const body = await request.post({
            url: 'https://api.twitter.com/oauth/request_token',
            oauth: {
                oauth_callback: "http%3A%2F%2Flocalhost%3A3000%2Ftwitter-callback",
                consumer_key: twitterConfig.consumerKey,
                consumer_secret: twitterConfig.consumerSecret
            }
        });
        const jsonStr = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
        res.send(JSON.parse(jsonStr));
    } catch (err) {
        return res.send(500, { message: err.message });
    }
}

const getUserDetails = async function (req, res) {
    try {
        const body = await request.get({
            url: 'https://api.twitter.com/1.1/users/show.json?screen_name=' + req.params.screenName,
            oauth: {
                consumer_key: twitterConfig.consumerKey,
                consumer_secret: twitterConfig.consumerSecret
            }

        });
        res.send(JSON.parse(body));
    } catch (err) {
        return res.send(500, { message: err.message });
    }
}

const getFollowersList = async function (req, res) {
    try {
        const body = await request.get({
            url: 'https://api.twitter.com/1.1/followers/list.json?screen_name=' + req.params.screenName,
            oauth: {
                consumer_key: twitterConfig.consumerKey,
                consumer_secret: twitterConfig.consumerSecret
            }
        });
        res.send(JSON.parse(body));
    } catch (err) {
        return res.send(500, { message: err.message });
    }
}

const createToken = function (auth) {
    return jwt.sign({
        id: auth.id
    }, 'my-secret',
        {
            expiresIn: 60 * 120
        });
};

const generateToken = function (req, res, next) {
    req.token = createToken(req.auth);
    return next();
};

const sendToken = function (req, res) {
    res.setHeader('x-auth-token', req.token);
    return res.status(200).send(JSON.stringify(req.user));
};

const setApiToken = function (req, res, next) {
    if (!req.user) {
        return res.send(401, 'User Not Authenticated');
    }
    req.auth = {
        id: req.user.id
    };
    return next();
}

module.exports = {
    oauthVerifier,
    request_token,
    getUserDetails,
    getFollowersList,
    generateToken,
    sendToken,
    setApiToken
}
