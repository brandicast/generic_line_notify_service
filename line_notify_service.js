const config = require('./config_brandon.js');

const log4js = require("log4js");
log4js.configure(config.log4js_set);
const logger = log4js.getLogger("LineNotify");

const express = require('express');
var session = require('express-session');
const app = express();
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'keyboard cat'
}));

app.use(express.static(config.line_notify.public_folder));

const fs = require("fs");
const path = require("path");

const https = require('https');

var TOKEN_JSON = {};



app.get(/service/, (req, res) => {

    console.log(req.session.id);
    // Retreive the string after "/service/"  on URL as service name
    var service = req.url.substring('/service/'.length);
    logger.info("Receiving request : " + req.url);
    logger.debug("Service Name : [" + service + "]");
    if (service != ""){

    // Redirect to Line for authorization
    var urlParams = new URLSearchParams('');
    urlParams.append('response_type', 'code');
    urlParams.append('client_id', config.line_notify.service[service].client_id);
    urlParams.append('redirect_uri', config.line_notify.service[service].redirect_uri + "?service=" + service);
    urlParams.append('scope', 'notify');
    urlParams.append('state', req.session.id);

    var redirect_script_html = '<script> window.location.href = "https://notify-bot.line.me/oauth/authorize?' + urlParams.toString() + '"</script>';

    logger.debug("Redirect Script : " + redirect_script_html);

    res.set('Content-Type', 'text/html');
    res.send(redirect_script_html);
    }
    else{
        res.redirect("/services.html");
    }
});




//  Receive "code" from LineNotify and use the code to request "token"
//  The "token"  is then used for sending message to LineNotify
app.get("/code_receiver", (req, res) => {

    service = req.query.service;
    code = req.query.code;
    state = req.query.state;
    logger.debug("/code_recevier :  service = " + service + " and code = " + code + " and state = " + state);

    var options = {
        root: path.join(__dirname)
    };

    res.sendFile(config.line_notify.service[service].success_page, options, function (err) {
        if (err) res.sendFile(404);
    });

    getToken(service, code, state);

});

function getToken(service, code, state) {

    var options = {
        hostname: 'notify-bot.line.me',
        path: '/oauth/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }

    var urlParams = new URLSearchParams();
    urlParams.append('grant_type', 'authorization_code');
    urlParams.append('code', code);
    urlParams.append('redirect_uri', config.line_notify.service[service].redirect_uri + "?service=" + service);
    urlParams.append('client_id', config.line_notify.service[service].client_id);
    urlParams.append('client_secret', config.line_notify.service[service].client_secret);

    postData = urlParams.toString();

    logger.debug(postData);

    doHTTP(options, postData, service, state, registerToken);
}

function doHTTP(options, postData, service, state, callback) {

    var req = https.request(options, (res) => {

        res.on('data', (d) => {
            logger.debug("[Reply from " + options.hostname + options.path + "]" + d + " | Headers : " + JSON.stringify(res.headers));
            if (callback)
                callback(service, state, d);
        });
    });

    req.on('error', (e) => {
        logger.error("[Reply from notify-bot.line.me] " + e);
    });

    req.write(postData);
    req.end();
}

function registerToken(service, state, callbackdata) {
    try {
        var json_d = JSON.parse(callbackdata);
        if (json_d.access_token) {
            if (TOKEN_JSON[service] == undefined) {
                TOKEN_JSON[service] = [];
            }
            var state_token_pair = {};
            state_token_pair["state"] = state;
            state_token_pair["access_token"] = json_d.access_token;

            TOKEN_JSON[service].push(state_token_pair);
            token_filename = path.join(config.line_notify.token_folder, config.line_notify.token_file);
            fs.writeFileSync(token_filename, JSON.stringify(TOKEN_JSON));

            sendWelcomeMessage(json_d.access_token, service);

        }
    } catch (err) {
        logger.error(err);
    }
}

function sendWelcomeMessage(token, service) {
    var msg = "歡迎加入 [" + service + "] 服務";
    var urlParams = new URLSearchParams();
    urlParams.append('message', msg);
    urlParams.append('stickerPackageId', 11538);
    urlParams.append('stickerId', 51626494);
    sendMessage(token, urlParams);
}

function sendMessage(token, urlParams) {

    var options = {
        hostname: 'notify-api.line.me',
        path: '/api/notify',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + token
        }
    }
    var postData = urlParams.toString();
    doHTTP(options, postData);
}

app.get("/sendMsg", (req, res) => {
    var service = req.query.service;
    var token = req.query.token;
    var msg = req.query.msg;

    var urlParams = new URLSearchParams();
    urlParams.append('message', msg);

    var info = "Sending msg : [" + msg + "] to ";
    if (token) {
        sendMessage(token, urlParams);
        logger.debug(info + "[" + token + "] only");
        info += "[" + token + "] only";
    }
    else {
        for (var index in TOKEN_JSON[service]) {
            logger.debug("Sending msg : [" + msg + "] to [" + TOKEN_JSON[service][index]["access_token"] + "]...");
            sendMessage(TOKEN_JSON[service][index]["access_token"], urlParams);
            info += TOKEN_JSON[service][index]["access_token"] + ",";
        }

    }

    res.send(info);
});

app.get("/access_token_list", (req, res) => {
    res.send(JSON.stringify(TOKEN_JSON));
});

app.get("/html_token_list", (req, res) => {
    service = req.query.service;

    var options = {
        root: path.join(__dirname)
    };
    res.sendFile(config.line_notify.service[service].token_list_page, options, function (err) {
        if (err) res.sendFile(404);
    });
});

//function doHTTP(options, postData, service, state,callback) {
app.get("/status", (req, res) => {
    if (req.query.token) {
        logger.debug("/status start");
        getStatus(req.query.token).then(d => {
            res.set('Content-Type', 'application/json');
            res.send(d);
            logger.debug("/status getStatus");
        });
        logger.debug("/status end");
    }
});

async function getStatus(token) {
    var result = await requestStatus(token);
    logger.debug("getStatus = " + result);
    return result;
};

function requestStatus(token) {
    return new Promise((resolve, reject) => {
        var options = {
            hostname: 'notify-api.line.me',
            path: '/api/status',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        }

        var req = https.request(options, (res) => {

            res.on('data', (d) => {
                logger.debug("[Reply from " + options.hostname + options.path + "]" + d);
                resolve(d);
            });
        });

        req.on('error', (e) => {
            logger.error("[Reply from notify-bot.line.me] " + e);
            reject(e);
        });

        req.write("");
        req.end();
    })
};


// Read available token files.
function init() {

    fs.stat(config.line_notify.token_folder, (err, stat) => {
        if (err) {
            fs.mkdirSync(config.line_notify.token_folder);
        }
    });

    token_filename = path.join(__dirname, config.line_notify.token_folder, config.line_notify.token_file);

    //  Asyn API to check file existence isn't a good practice in this case.  Need to change later.
    fs.stat(token_filename, (err, stat) => {
        if (err) {
            fs.writeFileSync(token_filename, JSON.stringify(TOKEN_JSON));
        } else {
            raw_json = fs.readFileSync(token_filename, "utf-8");
            if (raw_json) {
                TOKEN_JSON = JSON.parse(raw_json);
            } else
                TOKEN_JSON = {};
        }
    });
}



/****************************************************************************
 *    Main Start
 ****************************************************************************/

init();

app.listen(config.line_notify.port, config.line_notify.host);
logger.info("Line Notify Service running on : " + config.line_notify.host + ":" + config.line_notify.port);