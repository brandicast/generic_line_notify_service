module.exports = {
    line_notify : {
        service: { 
            "IOT_BOT": {
                client_id  :  'aIMLUjgcSAKALsaJvPwCgN' ,
                client_secret : 'lShondWx8DKm6xxV0AnKQLNinDHDUvZ3u7FUOxEwymb', 
                redirect_uri : 'http://192.168.0.15:8888/code_receiver',
                success_page : './success.html'  , 
                token_file : "./token_list.json" , 
            }
        },
        port : 8888,
        host : "0.0.0.0"
    }, 
    log4js_set: {
        appenders: {
                out: {
                        type: 'console'
                },
                app: {
                        type: 'file',
                        filename: 'logs/log.txt',
                        maxLogSize: 4096000,
                        backups: 9
                }
        },
        categories: {
                default: {
                        appenders: ['out', 'app'],
                        level: 'debug'
                }
        }
}

}