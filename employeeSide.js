const request = require('request');
var managerHelper = require('./managerToffyHelper.js')
var server = require('./server.js')
var sessionFlag = 0;
var generalCookies = "initial"
var IP = process.env.SLACK_IP

module.exports.showEmployeeProfile = function showEmployeeProfile(email, employeeEmail, msg) {
    var Approver2 = "---";
    printLogs("employeeEmail::" + employeeEmail)
    managerHelper.getIdFromEmail(email, employeeEmail, function (Id) {



        console.log("2-hrHelper.general_remember_me" + managerHelper.general_remember_me)
        console.log("2-hrHelper.general_session_id" + managerHelper.general_session_id)


        request({
            url: "http://" + IP + "/api/v1/employee/" + Id,
            json: true,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': managerHelper.general_remember_me + ";" + managerHelper.general_session_id
            },
        }, function (error, response, body) {
            if (response.statusCode == 404) {
                msg.say("Sorry the employee not exist")
            } else {

                console.log("3-" + response.statusCode)
                if (body.manager[1]) {
                    Approver2 = body.manager[1].name;

                }

                printLogs("show profile bod" + JSON.stringify(body))
                printLogs("show profile bod" + response.statusCode)
                var messageBody = {
                    "text": employeeEmail + " profile details",
                    "attachments": [
                        {
                            "attachment_type": "default",
                            "text": " ",
                            "fallback": "ReferenceError",
                            "fields": [
                                {
                                    "title": "Full name ",
                                    "value": body.name,
                                    "short": true
                                },
                                {
                                    "title": "Working days  ",
                                    "value": "Sun to Thu",
                                    "short": true
                                },
                                {
                                    "title": "Email ",
                                    "value": body.email,
                                    "short": true
                                },
                                {
                                    "title": "Approver 1",
                                    "value": body.manager[0].name,
                                    "short": true
                                },

                                {
                                    "title": "Emp.type ",
                                    "value": body.employeeType,
                                    "short": true
                                },
                                {
                                    "title": "Approver 2",
                                    "value": Approver2,
                                    "short": true
                                },
                                {
                                    "title": "Employment date",
                                    "value": body.hireDate,
                                    "short": true
                                }
                            ],
                            "color": "#F35A00"
                        }
                    ]
                }
                var stringfy = JSON.stringify(messageBody);
                var obj1 = JSON.parse(stringfy);
                msg.say(obj1)
            }
        });

    })

}

function printLogs(msg) {
    console.log("msg:========>:" + msg)
}


/***** 
Show Employee stats like annual vacation and etc.. from Hr side
*****/
module.exports.showEmployeeStats = function showEmployeeStats(email, employeeEmail, msg) {
    printLogs("showEmployeeStats")
    managerHelper.getIdFromEmail(email, employeeEmail, function (Id) {
        request({
            url: "http://" + IP + "/api/v1/employee/" + Id + "/balance",
            json: true,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': managerHelper.general_remember_me + ";" + managerHelper.general_session_id
            }
        }, function (error, response, body) {
            if (response.statusCode == 404) {
                msg.say("Sorry the employee not exist")
            }
            else {
                var messageBody = {
                    "text": employeeEmail + " stats and anuual time off details",
                    "attachments": [
                        {
                            "attachment_type": "default",
                            "text": " ",
                            "fallback": "ReferenceError",
                            "fields": [
                                {
                                    "title": "Rolled over",
                                    "value": parseFloat((body).left_over).toFixed(2) + " weeks ",
                                    "short": true
                                },
                                {
                                    "title": "Used time off  ",
                                    "value": parseFloat(body.consumed_vacation_balance).toFixed(2) + " weeks ",
                                    "short": true
                                },
                                {
                                    "title": "Annual time off ",
                                    "value": parseFloat(body.deserved_vacation).toFixed(2) + " weeks ",
                                    "short": true
                                },
                                {
                                    "title": "Used Sick time off  ",
                                    "value": parseFloat(body.consume_sick_vacation).toFixed(2) + " weeks ",
                                    "short": true
                                }
                                ,
                                {
                                    "title": "Extra time off  ",
                                    "value": parseFloat(body.compensation_balance).toFixed(2) + " weeks ",
                                    "short": false
                                },




                                {
                                    "title": "Balance",
                                    "value": parseFloat(body.left_over + body.compensation_balance + body.balance).toFixed(2) + " weeks ",
                                    "short": true
                                }

                            ],
                            "color": "#F35A00"
                        }
                    ]
                }
                var stringfy = JSON.stringify(messageBody);
                var obj1 = JSON.parse(stringfy);
                msg.say(obj1);
            }
        });
    })
}
//show employee history 
module.exports.showEmployeeHistory = function showEmployeeHistory(email, employeeEmail, msg) {
    printLogs("showEmployeeStats")
    managerHelper.getIdFromEmail(email, employeeEmail, function (Id) {
        var uri = 'http://' + IP + '/api/v1/employee/' + Id + '/vacations/2017'
        console.log("uri" + uri)

        request({
            url: uri,
            json: true,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': managerHelper.general_remember_me + ";" + managerHelper.general_session_id
            }
        }, function (error, response, body) {
            var i = 0;
            //check if no history ,so empty response
            if (!error && response.statusCode === 200) {
                console.log("HSON." + JSON.stringify(body))
                if (!(JSON.parse(body)[i])) {
                    msg.say("There are no requested vacations for you");
                }
                else {
                    //build message Json result to send it to slack
                    while ((JSON.parse(body)[i])) {
                        var stringMessage = "["
                        var fromDate = new Date((JSON.parse(body))[i].fromDate);
                        fromDate = fromDate.toString().split("GMT")
                        fromDate = fromDate[0]
                        var toDate = new Date((JSON.parse(body))[i].toDate)
                        toDate = toDate.toString().split("GMT")
                        toDate = toDate[0]
                        stringMessage = stringMessage + "{" + "\"title\":" + "\"" + "From date" + "\"" + ",\"value\":" + "\"" + fromDate + "\"" + ",\"short\":true}"
                        stringMessage = stringMessage + ","
                        stringMessage = stringMessage + "{" + "\"title\":" + "\"" + "To date" + "\"" + ",\"value\":" + "\"" + toDate + "\"" + ",\"short\":true}"
                        stringMessage = stringMessage + ","
                        stringMessage = stringMessage + "{" + "\"title\":" + "\"" + "Vacation state" + "\"" + ",\"value\":" + "\"" + (JSON.parse(body))[i].vacationState + "\"" + ",\"short\":true}"
                        var typeOfVacation = ""
                        if ((JSON.parse(body))[i].type == 0)
                            typeOfVacation = "Time off"
                        else if ((JSON.parse(body))[i].type == 4)
                            typeOfVacation = "Sick time off"
                        printLogs("stringMessage::" + stringMessage);
                        stringMessage = stringMessage + "]"
                        var messageBody = {
                            "text": "*" + typeOfVacation + "*",
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
                        printLogs("messageBody" + messageBody)
                        var stringfy = JSON.stringify(messageBody);

                        printLogs("stringfy" + stringfy)
                        stringfy = stringfy.replace(/\\/g, "")
                        stringfy = stringfy.replace(/]\"/, "]")
                        stringfy = stringfy.replace(/\"\[/, "[")
                        stringfy = JSON.parse(stringfy)

                        msg.say(stringfy)
                        i++;

                    }

                }
            }

        })
    })
}


