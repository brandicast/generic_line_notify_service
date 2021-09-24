const config = require('./config.js');

const log4js = require("log4js");
log4js.configure(config.log4js_set);
const logger =  log4js.getLogger("LineNotify") ;

const express = require('express');
const app = express();


app.get(/service/, (req, res) => {
    
    
    var service = req.url.substring('/service/'.length);
    logger.info("Receiving request : " + req.url);
    logger.debug ("Service Name : " + service) ;

    var urlParams  = new URLSearchParams('');
    urlParams.append ('response_type', 'code');
    urlParams.append ('client_id', config.line_notify.service[service].client_id);
    urlParams.append ('redirect_uri', config.line_notify.service[service].redirect_uri);
    urlParams.append ('scope', 'notify');
    urlParams.append ('state', 'NO_STATE');
    
    var redirect_script_html = '<script> window.location.href = "https://notify-bot.line.me/oauth/authorize?' + urlParams.toString() + "</script>";
    
    logger.debug ("Redirect Script : " + redirect_script_html) ;

res.set('Content-Type', 'text/html');
res.send(redirect_script_html);
});


app.listen(config.line_notify.port, config.line_notify.host);
logger.info("Line Notify Service running on : " + config.line_notify.host + ":" + config.line_notify.port);