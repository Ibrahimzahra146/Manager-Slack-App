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
    else if (arr[0] == "17" || arr[0] == "05" || arr[0] == "05") {
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
        TimeforMilliseconds = "9:" + arr[1]
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
    managerToffyHelper.convertTimeFormat(fromTime, function (formattedFromTime, middayFrom, TimeforMilliseconds) {
        managerToffyHelper.convertTimeFormat(toTime, function (formattedTime, midday, TimeforMilliseconds1) {
            getWorkingDays(fromMilliseconds, toMilliseconds, email, function (body) {
                var workingDays = parseFloat(body).toFixed(1);

                getmessage(formattedFromTime, middayFrom, fromDate, formattedTime, midday, ToDate, email, employeeEmail, type, timeOffcase, workingDays, function (messagetext) {

                    if (type == "sick") {
                        msg.say("Sorry to hear that :(")
                    }

                    var text12 = {
                        "text": "",
                        "attachments": [
                            {
                                "text": messagetext,
                                "callback_id": 'leave_with_vacation_confirm_reject',
                                "color": "#3AA3E3",
                                "attachment_type": "default",
                                "actions": [
                                    {
                                        "name": 'confirm',
                                        "text": "Yes",
                                        "style": "primary",
                                        "type": "button",
                                        "value": fromTime + "," + toTime + "," + email + "," + fromMilliseconds + "," + toMilliseconds + "," + type + "," + workingDays + "," + fromDate + "," + ToDate + "," + employeeEmail
                                    },
                                    {
                                        "name": 'reject',
                                        "text": "No",
                                        "style": "danger",
                                        "type": "button",
                                        "value": fromTime + "," + toTime + "," + email + "," + fromMilliseconds + "," + toMilliseconds + "," + type + "," + workingDays + "," + fromDate + "," + ToDate + "," + employeeEmail
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
}

function getWorkingDays(startDate, endDate, email, callback) {
    var vacationBody = {
        "from": startDate,
        "to": endDate

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
            console.log("getWorkingDays" + response.statusCode)
            console.log("getWorkingDays" + body);
            console.log("getWorkingDays" + JSON.stringify(body));
            callback(body)
        })

    })
}