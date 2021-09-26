module.exports = {
        line_notify : {
            service: { 
                "IOT_BOT": {
                    client_id  :  '' ,
                    client_secret : '', 
                    redirect_uri : 'http://192.168.0.13:8888/code_receiver',
                    success_page : './resources/success.html'  
                },
                "Generic Bot": {
                    client_id  :  '' ,
                    client_secret : '', 
                    redirect_uri : 'http://192.168.0.13:8888/code_receiver',
                    success_page : './resources/success.html'  
                },
                "dummy": {
                    client_id  :  '' ,
                    client_secret : '', 
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