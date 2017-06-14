const env=require('./public/configrations.js')

var requestify = require('requestify');
const request = require('request');
var server = require('./server')
var generalCookies = "initial"
var async = require('async');
const DateHelper = require('./DatesFunctions/datesFunctions.js')
var managerToffyHelper = require('./managerToffyHelper')
exports.generalCookies = generalCookies
var IP = process.env.SLACK_IP
var userIdInHr = "initial";
exports.userIdInHr = userIdInHr

var sessionFlag = 0;
exports.sessionFlag = sessionFlag
var general_remember_me = "";
exports.general_remember_me = general_remember_me;
var general_session_Id = "";
exports.general_session_Id = general_session_Id
var hrRole = 0
var currentBot = server.manager_bot;
module.exports.showEmployees = function showEmployees(msg, email) {
    var uri = 'http://' + IP + '/api/v1/employee/profile'


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
            body: email
            //Set the body as a stringcc
        }, function (error, response, body) {
            printLogs("body:" + body)
            callback(response, body)
        })
    })

}
module.exports.getRoleByEmail = function getRoleByEmail(email, role, callback) {
    printLogs("Getting roles")
    var flag = false;
    managerToffyHelper.getNewSessionwithCookie(email, function (remember_me_cookie, session_Id) {
        if (remember_me_cookie == 1000) {
            callback(1000)
        } else {
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
                if (JSON.parse(body).activated == false) {
                    callback(1000);
                } else {
                    var body = (JSON.parse(body));
                    var i = 0
                    while (body.roles[i]) {
                        printLogs("roles[i].name" + body.roles[i].name)
                        if (body.roles[i].name == role || body.roles[i].name == "APPROVER") {
                            flag = true;
                            break;
                        }
                        i++;

                    }
                    callback(flag)
                }

            })
        }
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
        console.log("response.statusCode == 500 " + response.statusCode)
        if (response.statusCode == 500 || response.statusCode == 451) {
            callback(1000, 1000)
        } else {
            var cookies = JSON.stringify((response.headers["set-cookie"])[1]);
            var arr = cookies.toString().split(";")
            res = arr[0].replace(/['"]+/g, '');
            var cookies1 = JSON.stringify((response.headers["set-cookie"])[0]);
            var arr1 = cookies1.toString().split(";")
            res1 = arr1[0].replace(/['"]+/g, '');
            printLogs("final session is =========>" + res)
            callback(res, res1);
        }
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
module.exports.getTodayDate = function getTodayDate(callback) {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    today = yyyy + '/' + mm + '/' + dd;
    callback(today)

}

function getmessage(formattedFromTime, middayFrom, fromDate, formattedTime, midday, ToDate, email, employeeEmail, type, timeOffcase, workingDays, callback) {
    var typeText = ""
    if (type == "sick") {
        typeText = " sick"
    }
    var messageText = ""
    if (timeOffcase == 1) {
        messageText = "Okay, you asked for a" + typeText + " time off for " + employeeEmail + " on " + fromDate + "  at, " + formattedFromTime + " " + middayFrom + "" + " to " + ToDate + " at " + formattedTime + " " + midday + " and that would be " + workingDays + " working days" + ". Should I go ahead ?"
    } else if (timeOffcase == 2) {
        messageText = "Okay, you asked for a" + typeText + " time off for " + employeeEmail + " from, " + formattedFromTime + " " + middayFrom + "" + " to " + formattedTime + " " + midday + " on " + ToDate + " and that would be " + workingDays + " working days" + ". Should I go ahead ?"

    } else if (timeOffcase == 3) {
        messageText = "Okay, you asked for a" + typeText + " time off for" + employeeEmail + " from, " + formattedFromTime + " " + middayFrom + "" + " to " + formattedTime + " " + midday + " at " + fromDate + " and that would be " + workingDays + " working days" + ". Should I go ahead ?"

    } else if (timeOffcase == 4) {
        messageText = "Okay, you asked for a" + typeText + " time off for " + employeeEmail + " on, " + fromDate + " at " + formattedFromTime + " " + middayFrom + " to the end of" + fromDate + ", and that would be " + workingDays + " working days" + ". Should I go ahead ?"


    } else if (timeOffcase == 5) {
        messageText = "Okay, you asked for a" + typeText + " time off for " + employeeEmail + " from, " + formattedFromTime + " " + middayFrom + " to " + formattedTime + " " + midday + " today and that would be " + workingDays + " working days" + ". Should I go ahead ?"

    } else if (timeOffcase == 6) {
        messageText = "Okay, you asked for a " + typeText + "time off for  " + employeeEmail + " at " + formattedFromTime + " " + middayFrom + " to 5:00: pm on " + fromDate + ", and that would be " + workingDays + " working days" + ". Should I go ahead ?"

    } else if (timeOffcase == 7) {
        messageText = "Okay, you asked for a " + typeText + "time off for " + employeeEmail + " on " + fromDate + "  at " + formattedFromTime + " " + middayFrom + "" + " to " + ToDate + " at " + formattedTime + " " + midday + " and that would be " + workingDays + " working days" + ". Should I go ahead ?"


    } else if (timeOffcase == 8) {
        messageText = "Okay, you asked for a" + typeText + " time off for " + employeeEmail + " from  " + fromDate + " to " + ToDate + " and that would be " + workingDays + " working days" + ". Should I go ahead ?"


    } else if (timeOffcase == 9) {
        messageText = "Okay, you asked for a" + typeText + " time off for  " + employeeEmail + " on " + fromDate + " and that would be 1 working day. Should I go ahead ? "


    } else if (timeOffcase == 10) {
        messageText = "Okay, you asked for a" + typeText + " time off  for " + employeeEmail + " from, " + formattedFromTime + " " + middayFrom + "" + " to the end of the day," + " and that would be " + workingDays + " working days" + ". Should I go ahead ?"


    } else if (timeOffcase == 11) {

    } else if (timeOffcase == 12) {

    }
    callback(messageText)

}
module.exports.sendVacationWithLeaveConfirmation = function sendLeaveSpecTimeSpecDayConfirmation(msg, fromTime, fromDate, toTime, ToDate, fromMilliseconds, toMilliseconds, email, employeeEmail, type, timeOffcase) {
    console.log("sendVacationWithLeaveConfirmation ")
    console.log("fromDate " + fromDate)
    console.log("fromTime " + fromTime)
    console.log("toTime " + toTime)
    console.log("ToDate " + ToDate)
    console.log("fromMilliseconds " + fromMilliseconds)
    console.log("toMilliseconds " + toMilliseconds)
    console.log("employeeEmail" + employeeEmail)
    var typeNum = ""
    if (type == "sick")
        typeNum = 4
    else typeNum = 0
    DateHelper.convertTimeFormat(fromTime, function (formattedFromTime, middayFrom, TimeforMilliseconds) {
        DateHelper.convertTimeFormat(toTime, function (formattedTime, midday, TimeforMilliseconds1) {
            getWorkingDays(fromMilliseconds, toMilliseconds, email, employeeEmail, typeNum, function (body) {
                var workingDays = parseFloat(body).toFixed(1);
                var wordFromDate = new Date(fromDate).toDateString();
                var wordTodate = new Date(ToDate).toDateString();

                getmessage(formattedFromTime, middayFrom, wordFromDate, formattedTime, midday, wordTodate, email, employeeEmail, type, timeOffcase, workingDays, function (messagetext) {
                    getIdByEmail(email, function (Id) {


                        if (type == "sick") {
                            msg.say("Sorry to hear that :(")
                        }

                        var text12 = {
                            "text": "",
                            "attachments": [
                                {
                                    "text": messagetext + "\n ( Note: Any official holiday will not be deducted from your time off request.)",
                                    "callback_id": 'leave_with_vacation_confirm_reject',
                                    "color": "#3AA3E3",
                                    "attachment_type": "default",
                                    "actions": [
                                        {
                                            "name": 'confirm',
                                            "text": "Yes      ",
                                            "style": "primary",
                                            "type": "button",
                                            "value": fromTime + "," + toTime + "," + email + "," + fromMilliseconds + "," + toMilliseconds + "," + type + "," + workingDays + "," + wordFromDate + "," + wordTodate + "," + employeeEmail + "," + Id
                                        },
                                        {
                                            "name": 'reject',
                                            "text": "No      ",
                                            "style": "danger",
                                            "type": "button",
                                            "value": fromTime + "," + toTime + "," + email + "," + fromMilliseconds + "," + toMilliseconds + "," + type + "," + workingDays + "," + wordFromDate + "," + wordTodate + "," + employeeEmail + "," + Id
                                        }
                                        ,
                                        {
                                            "name": 'confirm_without_detuction',
                                            "text": "don't detuct",
                                            "style": "good",
                                            "type": "button",
                                            "value": fromTime + "," + toTime + "," + email + "," + fromMilliseconds + "," + toMilliseconds + "," + type + "," + workingDays + "," + wordFromDate + "," + wordTodate + "," + employeeEmail + "," + Id
                                        }
                                    ]
                                }
                            ]
                        }
                        msg.say(text12)
                    })
                })
            });
        })
    })
}

function getWorkingDays(startDate, endDate, email, employeeEmail, typeNum, callback) {
    managerToffyHelper.getIdFromEmail(email, employeeEmail, function (Id) {
        var vacationBody = {
            "employee_id": Id,
            "from": startDate,
            "to": endDate,
            "type": typeNum

        }
        vacationBody = JSON.stringify(vacationBody)

        managerToffyHelper.getNewSessionwithCookie(email, function (cookies, session_Id) {
            request({
                url: "http://" + IP + "/api/v1/vacation/working-days", //URL to hitDs
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': cookies + ";" + session_Id
                },
                body: vacationBody
                //Set the body as a stringcc
            }, function (error, response, body) {
                console.log(" getWorkingDays" + response.statusCode)
                console.log("getWorkingDays" + body);
                console.log("getWorkingDays" + JSON.stringify(body));
                callback((JSON.parse(body)).workingPeriod)
            })

        })
    })
}


module.exports.sendVacationPostRequest = function sendVacationPostRequest(from, to, employee_id, email, type, callback) {
    printLogs("Sending vacation post request")
    printLogs("Email:" + email)
    printLogs("arrive at va")
    printLogs("from" + from);
    printLogs("to======>" + to);
    printLogs("type======>" + type);
    managerToffyHelper.getIdFromEmail(email, email, function (Id) {
        console.log("::::" + "::" + email + "::" + Id)
        var vacationType = "0"
        if (type == "sick") {
            vacationType = "4"
        }

        var vacationBody = {
            "employee_id": Id,
            "from": from,
            "to": to,
            "type": vacationType,
            "comments": "From ibrahim"

        }
        vacationBody = JSON.stringify(vacationBody)
        var uri = 'http://' + IP + '/api/v1/vacation'
        printLogs("Uri " + uri)
        request({
            url: uri, //URL to hitDs
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': managerToffyHelper.general_remember_me + ";" + managerToffyHelper.general_session_id
            },

            body: vacationBody
            //Set the body as a stringcc
        }, function (error, response, body) {
            printLogs("the vacation have been posted " + response.statusCode)
            printLogs(error)
            printLogs(response.message)
            var vacationId = (JSON.parse(body)).id;
            var managerApproval = (JSON.parse(body)).managerApproval
            printLogs("Vacaction ID---->" + (JSON.parse(body)).id)
            printLogs("managerApproval --->" + managerApproval)
            printLogs("managerApproval --->" + JSON.stringify(managerApproval))
            callback(vacationId, managerApproval);

        })
    });



}
/**
 * @Rules conflicts
 *  Send feedback to employee When manager submit a vacation for him 
 * 
 */
module.exports.sendFeedBackToEmpOnManagerBehalfFeedback = function sendFeedBackToEmpOnManagerBehalfFeedback(startDate, endDate, email, type, vacationId, managerApproval, toWho, workingDays) {
    env.mRequests.getSlackRecord(userEmail, function (error, response, body) {
        var responseBody = JSON.parse(body);
        var slack_message = env.stringFile.slack_message(responseBody.userChannelId, responseBody.slackUserId, responseBody.teamId)
    })
}

/** */
module.exports.getEmailById = function getEmailById(Path, email, callback) {
    makeGetRequest(Path, email, function (response, body) {

        callback(body)
    })

}
function makeGetRequest(path, email, callback) {
    managerToffyHelper.getNewSessionwithCookie(email, function (remember_me_cookie, session_Id) {
        var uri = 'http://' + IP + '/api/v1/' + path
        printLogs("uri " + uri)

        request({
            url: uri, //URL to hitDs
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': remember_me_cookie + ";" + session_Id

            }
            //Set the body as a stringcc
        }, function (error, response, body) {
            printLogs("email:" + body)
            callback(response, body)
        })

    })

}

//Help menu
module.exports.sendHelpOptions = function sendHelpOptions(msg) {
    var messageBody = {
        "text": "",
        "attachments": [
            {

                "pretext": "You can use on of the following expressions to engage with me:",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "fields": [
                    {
                        "title": "Submit time off for emp.name@exalt.ps today or on 10 May or from 10 May to 15 May",
                        "value": "",
                        "short": false
                    },
                    {
                        "title": "Show emp.name@exalt.ps profile or stats or history ",
                        "value": "",
                        "short": false
                    },
                    {
                        "title": "Who is off today or tomorrow or from 4 May to 10 May",
                        "value": "",
                        "short": false
                    },

                ]
            }
        ]
    }
    var stringfy = JSON.stringify(messageBody);
    var obj1 = JSON.parse(stringfy);
    msg.say(obj1)
}