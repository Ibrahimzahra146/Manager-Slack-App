const request = require('request');
var managerHelper = require('./managerToffyHelper.js')
var server = require('./server.js')
var sessionFlag = 0;
var generalCookies = "initial"
var IP = process.env.SLACK_IP
var employee = require("./employeeSide.js")
const async = require('async');

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
                            "color": "#F35A00",
                            thumb_url: body.profilePicture
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
    msg.say(employeeEmail + " history is :")
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

                if (!(body[i])) {
                    msg.say("There are no requested vacations for you");
                }
                else {
                    //build message Json result to send it to slack
                    while ((body)[i]) {
                        var parsedBody = body[i]
                        var stringMessage = "["
                        var fromDate = new Date(parsedBody.fromDate);
                        fromDate = fromDate.toString().split("GMT")
                        fromDate = fromDate[0]
                        var toDate = new Date(parsedBody.toDate)
                        toDate = toDate.toString().split("GMT")
                        toDate = toDate[0]
                        stringMessage = stringMessage + "{" + "\"title\":" + "\"" + "From date" + "\"" + ",\"value\":" + "\"" + fromDate + "\"" + ",\"short\":true}"
                        stringMessage = stringMessage + ","
                        stringMessage = stringMessage + "{" + "\"title\":" + "\"" + "To date" + "\"" + ",\"value\":" + "\"" + toDate + "\"" + ",\"short\":true}"
                        stringMessage = stringMessage + ","
                        stringMessage = stringMessage + "{" + "\"title\":" + "\"" + "Vacation state" + "\"" + ",\"value\":" + "\"" + parsedBody.vacationState + "\"" + ",\"short\":true}"
                        var typeOfVacation = ""
                        if (parsedBody.type == 0)
                            typeOfVacation = "Time off"
                        else if (parsedBody.type == 4)
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


module.exports.determineInfoType = function determineInfoType(managerEmail, employeeEmail, infoType, msg) {
    console.log("determineInfoType")
    console.log("employeeEmail" + employeeEmail)
    console.log("infoType" + infoType)
    if (infoType == "stats") {
        employee.showEmployeeStats(managerEmail, employeeEmail, msg);
        generalEmailForEmpInfo = ""
        generalEmpInfo = ""


    }
    else if (infoType == "profile") {
        employee.showEmployeeProfile(managerEmail, employeeEmail, msg)
        generalEmailForEmpInfo = ""
        generalEmpInfo = ""


    }
    else if (infoType == "history") {
        employee.showEmployeeHistory(managerEmail, employeeEmail, msg)
        generalEmailForEmpInfo = ""
        generalEmpInfo = ""

    }

}
module.exports.showEmployeePendingRequest = function showEmployeePendingRequest(email, employeeEmail, msg) {
    console.log("showEmployeePendingRequest" + email)
    console.log("showEmployeePendingRequest" + employeeEmail)
    var dont_detuct_button = ""
    managerHelper.getIdFromEmail(email, employeeEmail, function (employeeId) {
        managerHelper.getIdFromEmail(email, email, function (managerEmail) {
            var uri = 'http://' + IP + '/api/v1/employee/emp-pending-vacations?empId=' + employeeId + '&managerId=' + managerEmail
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
                getManagerEmailForPendingVacation(body[0].managerApproval, email, function (Id, manager) {
                    console.log("getManagerEmailForPendingVacation " + Id + "" + manager)
                    console.log("Ibrahimmm"+Id )

                    var i = 0;
                    //check if no history ,so empty response
                    if (!error && response.statusCode === 200) {
                        async.whilst(
                            function () { return body[i]; },
                            function (callback) {
                               /* console.log("body[i].id" + (body[i].id))
                                console.log("body[i].fromDate" + (body[i].fromDate))*/
                                i++;
                                setTimeout(callback, 2500);

                            },
                            function (err) {
                                // 5 seconds have passed
                            });

                        /*  if (type != "WFH") {
                              dont_detuct_button = {
                                  "name": "dont_detuct",
                                  "text": "Don’t Deduct ",
                                  "type": "button",
                                  "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + startDate + ";" + endDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                              }
                          }
      
      
      
      
                          var messageBody = {
                              "text": "This folk has pending time off request:",
                              "attachments": [
                                  {
                                      "attachment_type": "default",
                                      "callback_id": "manager_confirm_reject",
                                      "text": userEmail,
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
                                          }, commentFieldInManagerMessage,
                                          {
                                              "title": "Your action ",
                                              "value": "Pending :thinking_face:",
                                              "short": true
                                          }
                                          ,
                                          {
                                              "title": "Approver2 action",
                                              "value": approver2State,
                                              "short": true
                                          },
                                          {
                                              "title": "Final state",
                                              "value": "PendingManagerApproval :thinking_face:",
                                              "short": true
                                          }
                                      ],
                                      "actions": [
                                          {
                                              "name": "confirm",
                                              "text": "Accept",
                                              "style": "primary",
                                              "type": "button",
                                              "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + startDate + ";" + endDate + ";" + type + ";" + workingDays + ";" + ImageUrl + ";" + "Pending" + ";" + "Pending" + ";" + "Pending"
                                          },
                                          {
                                              "name": "reject",
                                              "text": "Reject",
                                              "style": "danger",
                                              "type": "button",
                                              "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + startDate + ";" + endDate + ";" + type + ";" + workingDays + ";" + ImageUrl + ";" + "Pending" + ";" + "Pending" + ";" + "Pending"
                                          },
                                          {
                                              "name": "reject_with_comment",
                                              "text": "Reject with comment",
                                              "style": "danger",
                                              "type": "button",
                                              "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + startDate + ";" + endDate + ";" + type + ";" + workingDays + ";" + ImageUrl + ";" + "Pending" + ";" + "Pending" + ";" + "Pending"
                                          }, dont_detuct_button,
                                          {
                                              "name": "check_state",
                                              "text": ":arrows_counterclockwise:",
      
                                              "type": "button",
                                              "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + startDate + ";" + endDate + ";" + type + ";" + workingDays + ";" + ImageUrl + ";" + "Pending" + ";" + "Pending" + ";" + "Pending"
                                          },
                                      ],
                                      "color": "#F35A00",
                                      "thumb_url": ImageUrl,
                                  }
                              ]
                          }*/
                    }
                })
            })

        })
    })

}
function getManagerEmailForPendingVacation(managerApprovels, email, callback) {
    var i = 0
    console.log("getManagerEmailForPendingVacation" + JSON.stringify(managerApprovels))
    async.whilst(
        function () { return managerApprovels[i]; },
        function (callback) {
            if (managerApprovels[i].managerEmail == email && managerApprovels[i].type == "Manager") {
                console.log("managerApprovels[i].id," + managerApprovels[i].id)
                callback(managerApprovels[i].id, managerApprovels[i].manager)

            }
          
            //console.log("body[i].fromDate" + (managerApprovels[i].email))
            i++;
            setTimeout(callback, 2500);

        },
        function (err) {
            // 5 seconds have passed
        });

}