var requestify = require('requestify');
const request = require('request');
var server = require('./server')
var generalCookies = "initial"
exports.generalCookies = generalCookies
var IP = process.env.SLACK_IP
var userIdInHr = "initial";
exports.userIdInHr = userIdInHr
var managerToffyHelper = require('./managerToffyHelper')
var sessionFlag = 0;
exports.sessionFlag = sessionFlag
var general_remember_me = "";
exports.general_remember_me = general_remember_me;
var general_session_Id = "";
exports.general_session_Id = general_session_Id
module.exports.showEmployees = function showEmployees(msg, email) {
    printLogs("arrive at show employees")
    var uri = 'http://' + IP + '/api/v1/employee/profile'
    printLogs("Url :    " + uri)
    printLogs("generalCookies " + managerToffyHelper.generalCookies)


    getIdByEmail(email, function (Id) {
        var uri = 'http://' + IP + '/api/v1/employee/manager/' + Id + '/direct'

        request({
            url: uri,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': managerToffyHelper.general_remember_me + ";" + managerToffyHelper.general_session_Id
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
function makePostRequest(path, email, callback) {
    managerToffyHelper.getNewSessionwithCookie(email, function (remember_me_cookie, session_Id) {
        var uri = 'http://' + IP + '/api/v1/' + path
        managerToffyHelper.general_remember_me = remember_me_cookie;
        managerToffyHelper.general_session_Id = session_Id;
        printLogs("uri " + uri)
        request({
            url: uri, //URL to hitDs
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': remember_me_cookie + ";" + session_Id

            },
            body: body1
            //Set the body as a stringcc
        }, function (error, response, body) {
            printLogs("body:" + body)
            callback(response, body)
        })
    })

}
module.exports.getRoleByEmail = function getRoleByEmail(email, role, callback) {
    var flag = false;
    managerToffyHelper.getNewSessionwithCookie(email, function (remember_me_cookie, session_Id) {
        request({
            url: 'http://' + IP + '/api/v1/employee/roles', //URL to hitDs
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': remember_me_cookie + ";" + session_Id

            },
            body: email
            //Set the body as a stringcc
        }, function (error, response, body) {
            var roles = (JSON.parse(body));
            var i = 0
            while (roles[i]) {
                printLogs("roles[i].name" + roles[i].name)
                if (roles[i].name == role) {
                    flag = true;
                    break;
                }
                i++;

            }
            callback(flag)

        })
    })
}
module.exports.getNewSessionwithCookie = function getNewSessionwithCookie(email, callback) {
    request({
        url: 'http://' + IP + '/api/v1/employee/login', //URL to hitDs
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: email
        //Set the body as a stringcc
    }, function (error, response, body) {
        var cookies = JSON.stringify((response.headers["set-cookie"])[1]);
        var arr = cookies.toString().split(";")
        res = arr[0].replace(/['"]+/g, '');
        var cookies1 = JSON.stringify((response.headers["set-cookie"])[0]);
        var arr1 = cookies1.toString().split(";")
        res1 = arr1[0].replace(/['"]+/g, '');
        printLogs("final session is =========>" + res)
        callback(res, res1);
    });


}

module.exports.getIdFromEmail = function getIdFromEmail(email, employeeEmail, callback) {

    managerToffyHelper.getNewSessionwithCookie(email, function (remember_me_cookie, sessionId) {
        managerToffyHelper.general_remember_me = remember_me_cookie
        managerToffyHelper.general_session_id = sessionId

        console.log("1-hrHelper.general_remember_me+ " + managerToffyHelper.general_remember_me)
        printLogs("hrHelper.generalCookies=======> " + managerToffyHelper.generalCookies)
        printLogs("==========>Getting user id from Hr")
        request({
            url: "http://" + IP + "/api/v1/employee/get-id", //URL to hitDs
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': managerToffyHelper.general_remember_me
            },
            body: employeeEmail
            //Set the body as a stringcc
        }, function (error, response, body) {
            printLogs("=======>body: " + body)

            printLogs(JSON.stringify(body))
            callback(body)

        })
    });



}