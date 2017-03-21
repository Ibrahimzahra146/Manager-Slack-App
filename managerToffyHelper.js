var requestify = require('requestify');
const request = require('request');
var server = require('./server')
var generalCookies = "initial"
var IP = process.env.SLACK_IP
var userIdInHr = "initial";
exports.userIdInHr = userIdInHr
var managerToffyHelper = require('./managerToffyHelper')
var sessionFlag = 0;
module.exports.showEmployees = function showEmployees(msg, email) {
    printLogs("arrive at show employees")

    managerToffyHelper.getNewSession(email, function (cookie) {
        generalCookies = cookie;
        getIdByEmail(email, function (Id) {
            var uri = 'http://' + IP + '/api/v1/employee/manager/' + Id + '/direct'
            printLogs("Url :    " + uri)
            printLogs("generalCookies " + generalCookies)
            request({
                url: uri,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': generalCookies
                },
            }, function (error, response, body) {
                printLogs("response.statusCode" + response.statusCode);
                var i = 0;
                var stringMessage = "["
                if (!error && response.statusCode === 200) {
                    while ((JSON.parse(body)[i])) {

                        if (i > 0) {
                            stringMessage = stringMessage + ","
                        }
                        stringMessage = stringMessage + "{" + "\"title\":" + "\"" + "Name: " + (JSON.parse(body))[i].name + "\"" + ",\"value\":" + "\"" + "Email: " + (JSON.parse(body))[i].email + "\"" + ",\"short\":true}"
                        i++;

                    }
                    stringMessage = stringMessage + "]"
                    var messageBody = {
                        "text": "Your employees",
                        "attachments": [
                            {
                                "attachment_type": "default",
                                "text": " ",
                                "fallback": "ReferenceError",
                                "fields": stringMessage,
                                "color": "#F35A00"
                            }
                        ]
                    }
                    var stringfy = JSON.stringify(messageBody);

                    stringfy = stringfy.replace(/\\/g, "")
                    stringfy = stringfy.replace(/]\"/, "]")
                    stringfy = stringfy.replace(/\"\[/, "[")
                    stringfy = JSON.parse(stringfy)

                    msg.say(stringfy)
                }
            })
        })


    })

}


/*
get new session id using login api
*/
module.exports.getNewSession = function getNewSession(email, callback) {
    printLogs("arrive at get new session")
    var res = generalCookies
    printLogs("email: " + email)

    if (sessionFlag == 1) {
        res = generalCookies
        callback(res)

    } else {
        printLogs("getting new session")
        request({
            url: 'http://' + IP + '/api/v1/employee/login', //URL to hitDs
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': generalCookies

            },
            body: email
            //Set the body as a stringcc
        }, function (error, response, body) {
            printLogs("new Session response with statusCode =" + response.statusCode)

            var cookies = JSON.stringify((response.headers["set-cookie"])[0]);
            printLogs(cookies)
            var arr = cookies.toString().split(";")
            res = arr[0].replace(/['"]+/g, '');
            printLogs("final session:" + res)
            sessionFlag = 1;
            callback(res);
        });
    }
}
function printLogs(msg) {
    console.log("msg:========>:" + msg)
}
function getIdByEmail(email, callback) {

    makePostRequest('employee/get-id', email, function (response, body) {
        printLogs("body:" + body)
        callback(body)
    })

}
function makePostRequest(path, body1, callback) {
    var uri = 'http://' + IP + '/api/v1/' + path
    printLogs("uri " + uri)
    printLogs("Email: " + body1)
    request({
        url: uri, //URL to hitDs
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': generalCookies

        },
        body: body1
        //Set the body as a stringcc
    }, function (error, response, body) {
        printLogs("body:" + body)
        callback(response, body)
    })
}
module.exports.getRoleByEmail = function getRoleByEmail(email,role, callback) {
    printLogs("getting Roles");
    request({
        url: 'http://' + IP + '/api/v1/employee/roles', //URL to hitDs
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': generalCookies

        },
        body: email
        //Set the body as a stringcc
    }, function (error, response, body) {
        if (response.statusCode = 403) {
            sessionFlag = 0;
        }
        managerToffyHelper.getNewSession(email, function (cookies) {
            generalCookies = cookies;
            request({
                url: 'http://' + IP + '/api/v1/employee/roles', //URL to hitDs
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': generalCookies

                },
                body: email
                //Set the body as a stringcc
            }, function (error, response, body) {
                var roles = (JSON.parse(body));
                var i = 0
                while (roles[i]) {
                    if (roles[i].name == role) {
                        callback(true)
                        break;
                    }
                    i++;

                }
                callback(false)

            })
        })

    })
}