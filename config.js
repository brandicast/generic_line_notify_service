module.exports = {
        line_notify : {
            service: { 
                "mimosa2 ": {
                    client_id  :  '' ,
                    client_secret : '', 
                    redirect_uri : 'http://192.168.68.57:8888/code_receiver',  //this ip has to match your configuration on Line Notify
                    success_page : './resources/success.html',  
                    token_list_page : './resources/token_list.html' 
                },
                "service2": {
                    client_id  :  '' ,
                    client_secret : '', 
                    redirect_uri : 'http://192.168.0.15:8888/code_receiver',
                    success_page : './resources/success.html' , 
                    token_list_page : './resources/token_list.html' 
                },
                "service3": {
                    client_id  :  '' ,
                    client_secret : '', 
                    redirect_uri : 'http://192.168.0.15:8888/code_receiver',
                    success_page : './resources/success.html' ,
                    token_list_page : './resources/token_list.html' 
                }
            },
            port : 8888,
            host : "0.0.0.0",
            token_folder: "./token", 
            token_file: "token.json",
            public_folder: "./public"
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