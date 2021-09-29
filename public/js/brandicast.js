console.log ("Iam brandicast.js") ;


/*
    async HTTP request wrapper.
    async function alwasy return a Promise.   
    The caller may just use the Promise.then (d => )  to do whatever it wants to
*/
async function getHTTPContentPromise(url) {
    const promise = await new Promise((resolve, reject) => {
        const xmlhttp = new XMLHttpRequest();
        xmlhttp.onload = function () {
            resolve(this.responseText);
        };
        xmlhttp.error = function (err) {
            reject(err);
        };
        xmlhttp.open("GET", url);
        xmlhttp.send();
    });
    return promise;
}


/*
    Making Synchroized HTTP request to get the content.  
    HOWEVER, this is being deprecated by many browser.
*/
function getHTTPContentSync(url) {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    var text = xmlhttp.responseText;
    return text; 
}
