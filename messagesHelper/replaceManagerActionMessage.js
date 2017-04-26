const request = require('request');
var managerHelper = require('.././managerToffyHelper.js')
var server = require('.././server.js')
var sessionFlag = 0;
var generalCookies = "initial"
var IP = process.env.SLACK_IP
module.exports.replaceMessage = function replaceMessage(msg, userEmail, managerEmail, fromDate, toDate, type, approvalType, vacationId, approvalId, ImageUrl, typeText, workingDays) {
    console.log("ImageUrl" + ImageUrl)
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
                        "value": fromDate,
                        "short": true
                    },
                    {
                        "title": "Days/Time ",
                        "value": workingDays + " day",
                        "short": true
                    },
                    {
                        "title": "to",
                        "value": toDate,
                        "short": true
                    },
                    {
                        "title": "Type",
                        "value": type,
                        "short": true
                    },
                    {
                        "title": "State of vacation ",
                        "value": approvalType,
                        "short": true
                    }
                ],
                "actions": [
                    {
                        "name": "Undo",
                        "text": "Undo",
                        "style": "primary",
                        "type": "button",
                        "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                    }
                ],
                "color": "#F35A00",
                "thumb_url": ImageUrl,
            }
        ]
    }
    msg.respond(msg.body.response_url, messageBody)
}
//return original message when click on undo
module.exports.undoAction = function unduAction(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays) {
    var dont_detuct_button = ""
    if (type != "WFH") {
        dont_detuct_button = {
            "name": "dont_detuct",
            "text": "Don’t Deduct ",
            "type": "button",
            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
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
                        "value": fromDate,
                        "short": true
                    },
                    {
                        "title": "Days/Time ",
                        "value": workingDays + " day",
                        "short": true
                    },
                    {
                        "title": "to",
                        "value": toDate,
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
                        "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                    },
                    {
                        "name": "reject",
                        "text": "Reject",
                        "style": "danger",
                        "type": "button",
                        "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                    }, dont_detuct_button
                ],
                "color": "#F35A00",
                "thumb_url": ImageUrl,
            }
        ]
    }
    msg.respond(msg.body.response_url, messageBody)
}

