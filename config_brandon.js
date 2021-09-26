module.exports = {
    line_notify : {
        service: { 
            "IOT_BOT": {
                client_id  :  '1Co3qNTYnvw9x1X9Zd5dt5' ,
                client_secret : '1fh5AuEEMYEBqZeuZNI6uVQortnrByxwOsrF1QVebuI', 
                redirect_uri : 'http://192.168.0.13:8888/code_receiver',
                success_page : './resources/success.html'  
            },
            "Generic Bot": {
                client_id  :  'aIMLUjgcSAKALsaJvPwCgN' ,
                client_secret : 'lShondWx8DKm6xxV0AnKQLNinDHDUvZ3u7FUOxEwymb', 
                redirect_uri : 'http://192.168.0.13:8888/code_receiver',
                success_page : './resources/success.html'  
            },
            "dummy": {
                client_id  :  '65AL628tEQw8KGcEMFjPiq' ,
                client_secret : 'F2w50Yh32BYXP0TBGqM7FPab78wUfdRaiBU2lPbLrUh', 
                redirect_uri : 'http://192.168.0.13:8888/code_receiver',
                success_page : './resources/success.html'  
            }
        },
        port : 8888,
        host : "0.0.0.0",
        token_folder: "./token", 
        token_file: "token.json"
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