var requestify = require('requestify');
const request = require('request');
var server = require('./server')
var generalCookies = "initial"
var async = require('async');
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
var hrRole = 0
var currentBot = server.manager_bot;
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
    console.log("Hi1")
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
    console.log("Hi12")


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
module.exports.convertTimeFormat = function convertTimeFormat(time, callback) {
    console.log("The Time is =" + time)
    var arr = time.toString().split(":")
    var formattedTime = ""
    var midday = "pm";
    var TimeforMilliseconds = ""
    var n = arr[1].length;
    if (n == 1) {
        arr[1] = "0" + arr[1]
    }

    if (arr[0] == "13" || arr[0] == "01" || arr[0] == "1") {
        formattedTime = "01:" + arr[1];
        TimeforMilliseconds = "13:" + arr[1]
    }
    else if (arr[0] == "14" || arr[0] == "02" || arr[0] == "2") {
        formattedTime = "02:" + arr[1];
        TimeforMilliseconds = "14:" + arr[1]
    }
    else if (arr[0] == "15" || arr[0] == "03" || arr[0] == "3") {
        formattedTime = "03:" + arr[1];
        TimeforMilliseconds = "15:" + arr[1]
    }
    else if (arr[0] == "16" || arr[0] == "04" || arr[0] == "4") {
        formattedTime = "04:" + arr[1];
        TimeforMilliseconds = "16:" + arr[1]
    }
    else if (arr[0] == "05" || arr[0] == "05") {
        formattedTime = "05:" + arr[1];
        TimeforMilliseconds = "05:" + arr[1]
    }
    else if (arr[0] == "17") {
        formattedTime = "05:" + arr[1];
        TimeforMilliseconds = "17:" + arr[1]
    }

    else if (arr[0] == "20" || arr[0] == "08" || arr[0] == "8") {
        formattedTime = "08:" + arr[1];
        midday = "am"
        TimeforMilliseconds = "8:" + arr[1]

    }
    else if (arr[0] == "21" || arr[0] == "09" || arr[0] == "9") {
        formattedTime = "09:" + arr[1];
        midday = "am"
        TimeforMilliseconds = "21:" + arr[1]
    }
    else if (arr[0] == "22" || arr[0] == "10") {
        formattedTime = "10:" + arr[1];
        midday = "am"
        TimeforMilliseconds = "10:" + arr[1]
    }
    else if (arr[0] == "23" || arr[0] == "11") {
        formattedTime = "11:" + arr[1];
        midday = "am"
        TimeforMilliseconds = "11:" + arr[1]
    }
    else if (arr[0] == "00" || arr[0] == "12") {
        formattedTime = "12:" + arr[1];
        midday = "am"
        TimeforMilliseconds = "12:" + arr[1]
    }

    else {
        formattedTime = arr[0] + ":" + arr[1];
        midday = "am";
    }
    console.log("TimeforMilliseconds" + TimeforMilliseconds)
    callback(formattedTime, midday, TimeforMilliseconds)
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
    managerToffyHelper.convertTimeFormat(fromTime, function (formattedFromTime, middayFrom, TimeforMilliseconds) {
        managerToffyHelper.convertTimeFormat(toTime, function (formattedTime, midday, TimeforMilliseconds1) {
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
module.exports.sendVacationToManager = function sendVacationToManager(startDate, endDate, email, type, vacationId, managerApproval, toWho, workingDays) {
    console.log("arrive at send vacation to maangers" + email)
    var message12 = ""
    var approvarType = ""
    var approvalId = ""
    var managerEmail = ""
    if (type == "sickLeave") {
        type = "sick"
    }

    var i = 0
    var j = 0

    console.log("Mnaagers approvals  ::::" + JSON.stringify(managerApproval))
    async.whilst(
        function () { return managerApproval[i]; },
        function (callback) {

            /* if (managerApproval[2]) {
                 console.log("here 11")
                 console.log("managerApproval[2].type" + managerApproval[2].type)
                 if (managerApproval[2].type == "Manager") {
                     console.log("here 12")
                     i = 2
                 }
         
             } if (managerApproval[1]) {
                 console.log("managerApproval[1].type" + managerApproval[1].type)
         
                 console.log("here 13")
         
                 if (managerApproval[1].type == "Manager") {
                     console.log("here 14")
         
                     i = 1
                 }
             }
         */

            var x = managerToffyHelper.getEmailById('employee/email/' + managerApproval[i].manager, email, function (emailFromId) {
                console.log("email !=  emailFromId)" + email + "!=" + emailFromId)
                emailFromId = emailFromId.replace(/\"/, "")
                emailFromId = emailFromId.replace(/\"/, "")

                console.log("email !=  emailFromId)" + email + "!=" + emailFromId)

                if (email != emailFromId) {
                    console.log("Arrive  after get emailFromId:: " + i)

                    console.log("mananger email::: " + managerEmail);
                    console.log("approvarType" + approvarType);
                    approvalId = managerApproval[i].id
                    approvarType = managerApproval[i].type
                    managerEmail = emailFromId.replace(/\"/, "")
                    managerEmail = managerEmail.replace(/\"/, "")
                    console.log("Second i" + i)

                    request({
                        url: 'http://' + IP + '/api/v1/toffy/get-record', //URL to hitDs
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',

                        },
                        body: emailFromId
                        //Set the body as a stringcc
                    }, function (error, response, body) {

                        var jsonResponse = JSON.parse(body);
                        console.log("approvarType:::" + approvarType)
                        if (approvarType == "Manager") {
                            printLogs("Manager Role ")
                            message12 = {
                                'type': 'message',
                                'channel': jsonResponse.managerChannelId,
                                user: jsonResponse.slackUserId,
                                text: 'what is my name',
                                ts: '1482920918.000057',
                                team: jsonResponse.teamId,
                                event: 'direct_message'

                            }

                        } else {
                            printLogs("HR Role")
                            hrRole = 1
                            message12 = {
                                'type': 'message',

                                'channel': jsonResponse.hrChannelId,
                                user: jsonResponse.slackUserId,
                                text: 'what is my name',
                                ts: '1482920918.000057',
                                team: jsonResponse.teamId,
                                event: 'direct_message'
                            }

                        }
                        var messageBody = {
                            "text": "This folk has pending time off request:",
                            "attachments": [
                                {
                                    "attachment_type": "default",
                                    "callback_id": "manager_confirm_reject",
                                    "text": email,
                                    "fallback": "ReferenceError",
                                    "fields": [
                                        {
                                            "title": "From",
                                            "value": startDate,
                                            "short": true
                                        },
                                        {
                                            "title": "Days/Time ",
                                            "value": workingDays + " day",
                                            "short": true
                                        },
                                        {
                                            "title": "to",
                                            "value": endDate,
                                            "short": true
                                        },
                                        {
                                            "title": "Type",
                                            "value": type,
                                            "short": true
                                        }
                                    ],
                                    "actions": [
                                        {
                                            "name": "confirm",
                                            "text": "Accept",
                                            "style": "primary",
                                            "type": "button",
                                            "value": email + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";manager" + ";" + startDate + ";" + endDate
                                        },
                                        {
                                            "name": "reject",
                                            "text": "Reject",
                                            "style": "danger",
                                            "type": "button",
                                            "value": email + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";manager" + ";" + startDate + ";" + endDate
                                        }, {
                                            "name": "dont_detuct",
                                            "text": "Don’t Deduct ",
                                            "type": "button",
                                            "value": email + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";manager" + ";" + startDate + ";" + endDate
                                        }
                                    ],
                                    "color": "#F35A00"
                                }
                            ]
                        }
                        if (approvarType == "Manager") {
                            currentBot = server.manager_bot;

                        } else {

                            console.log("Arrive")
                        }
                        currentBot.startConversation(message12, function (err, convo) {


                            if (!err) {

                                var stringfy = JSON.stringify(messageBody);
                                var obj1 = JSON.parse(stringfy);
                                currentBot.reply(message12, obj1);

                            }
                        });
                        flagForWhileCallbacks = 1

                    });
                }
                i++;
            })

            setTimeout(callback, 5000);

        },
        function (err) {
            // 5 seconds have passed
        }

    );
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
module.exports.showWhoIsOff = function showWhoIsOff(msg, email, date, date1) {
    managerToffyHelper.getNewSessionwithCookie(email, function (remember_me_cookie, session_Id) {
        var uri = 'http://' + IP + '/api/v1/employee/off?from=' + date + '&to=' + date1
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
            var obj = JSON.parse(body);
            var stringMessage = "["
            var i = 0
            printLogs("email:" + JSON.stringify(body))
            if (!obj[0])
                msg.say("There are no off employees.")
            else {
                while (obj[i]) {
                    if (i > 0) {
                        stringMessage = stringMessage + ","
                    }
                    stringMessage = stringMessage + "{" + "\"title\":" + "\"" + (JSON.parse(body))[i].name + "\"" + ",\"value\":" + "\"" + (JSON.parse(body))[i].email + "\"" + ",\"short\":false}"
                    i++;
                }
                stringMessage = stringMessage + "]"
                console.log("stringMessage", stringMessage)
                var messageBody = {
                    "text": "These employees are off :",
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

                printLogs("stringfy " + stringfy)
                stringfy = stringfy.replace(/\\/g, "")
                stringfy = stringfy.replace(/]\"/, "]")
                stringfy = stringfy.replace(/\"\[/, "[")
                stringfy = JSON.parse(stringfy)
                msg.say(stringfy);
            }
        })


    })


}