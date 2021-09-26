const config = require('./config_brandon.js');

const log4js = require("log4js");
log4js.configure(config.log4js_set);
const logger = log4js.getLogger("LineNotify");

const express = require('express');
const app = express();

const fs = require("fs");
const path = require("path");

const https = require('https');

var TOKEN_JSON = {};

app.get(/service/, (req, res) => {


    // Retreive the string after "/service/"  on URL as service name
    var service = req.url.substring('/service/'.length);
    logger.info("Receiving request : " + req.url);
    logger.debug("Service Name : [" + service + "]");

    // Redirect to Line for authorization
    var urlParams = new URLSearchParams('');
    urlParams.append('response_type', 'code');
    urlParams.append('client_id', config.line_notify.service[service].client_id);
    urlParams.append('redirect_uri', config.line_notify.service[service].redirect_uri + "?service=" + service);
    urlParams.append('scope', 'notify');
    urlParams.append('state', 'NO_STATE');

    var redirect_script_html = '<script> window.location.href = "https://notify-bot.line.me/oauth/authorize?' + urlParams.toString() + '"</script>';

    logger.debug("Redirect Script : " + redirect_script_html);

    res.set('Content-Type', 'text/html');
    res.send(redirect_script_html);
});


app.get ("/sendMsg") , (req, res) => {
    var servcice = req.query.service ;
    var token = req.query.token ;
    var msg = req.query.msg ; 

}

//  Receive "code" from LineNotify and use the code to request "token"
//  The "token"  is then used for sending message to LineNotify
app.get("/code_receiver", (req, res) => {

    service = req.query.service;
    code = req.query.code;
    logger.debug("/code_recevier :  service = " + service + " and code = " + code);

    var options = { 
        root:path.join(__dirname) 
    }; 
      
    res.sendFile(config.line_notify.service[service].success_page, options,function (err) {
        if (err) res.sendFile(404);
    });

    getToken(service, code);

});

function getToken(service, code) {

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

    doHTTPSPost(options, postData, service, registerToken);
}

function doHTTPSPost(options, postData, service, callback) {

    var req = https.request(options, (res) => {

        res.on('data', (d) => {
            logger.debug("[Reply from " + options.hostname + options.path + "]" + d);
            if (callback)
                callback(service, d);
        });
    });

    req.on('error', (e) => {
        logger.error("[Reply from notify-bot.line.me] " + e);
    });

    req.write(postData);
    req.end();
}

function registerToken(service, callbackdata) {
    try {
        var json_d = JSON.parse(callbackdata);
        if (json_d.access_token) {
            if (TOKEN_JSON[service] == undefined)  {
                TOKEN_JSON[service] = [] ;
            }
            TOKEN_JSON[service].push(json_d.access_token);
            token_filename = path.join(config.line_notify.token_folder, config.line_notify.token_file);
            fs.writeFileSync(token_filename, JSON.stringify(TOKEN_JSON));
            sendMessage(json_d.access_token, "Welcome Join  Service : " + service);
        }
    } catch (err) {
        logger.error(err);
    }
}

function sendMessage(token, msg) {

    var options = {
        hostname: 'notify-api.line.me',
        path: '/api/notify',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + token
        }
    }

    var urlParams = new URLSearchParams();
    urlParams.append('message', msg);
    urlParams.append ('stickerPackageId', 11538) ;
    urlParams.append ('stickerId', 51626494) ;

    var postData =  urlParams.toString();

    doHTTPSPost (options, postData) ;
}


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