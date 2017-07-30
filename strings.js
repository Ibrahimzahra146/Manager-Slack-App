const env = require('./public/configrations.js')
//Holiday nodtice 
var holiday_notice = "\n ( Note: Any official holiday will not be deducted from your time off request.)"
exports.holiday_notice = holiday_notice

/**
 * 
 * 
 */
/**
 * 
 * Manager pending request reminder message
 */
module.exports.pending_request_reminder = function (numberOfPendingRequests, email) {
    var name = email.toString().split('@')
    name = name[0];
    var text = "Hi " + name + ", you have " + numberOfPendingRequests + " pending requests."
    var message = {
        "text": "",
        "attachments": [
            {
                "text": text,
                "callback_id": 'reminders',
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "show.pending",
                        "text": "Show pendings",
                        "type": "button",
                        "value": email + ";" + "Show pending",
                        confirm: {
                            title: "Employee comment",
                            text: "Comment:"+"I want compensatio ",
                            ok_text: "Yes",
                            dismiss_text: "No"
                        },

                    }
                ]
            }
        ]
    }
    return message;

}
module.exports.manager_message_on_accept_with_report = function manager_message_on_accept_with_report(email, fromDate, toDate) {
    var message = "The approver " + email + " asked you to submit a sick report for your sick time from ( " + fromDate + "-" + toDate + " )";
    return message;
}

module.exports.slack_message = function (userChannelId, slackUserId, teamId) {
    const slack_message = {
        'type': 'message',
        'channel': userChannelId,
        user: slackUserId,
        text: 'what is my name',
        ts: '1482920918.000057',
        team: teamId,
        event: 'direct_message'
    };
    return slack_message;
}
/**
 * 
 * 
 */

module.exports.upload_sick_report_message = function upload_sick_report_message(email, vacationId, fromDate, toDate, messageFB) {
    messageFB = env.stringFile.manager_message_on_accept_with_report(email, fromDate, toDate)
    var message = {
        "text": "",
        "attachments": [
            {
                "text": messageFB,
                "callback_id": 'cancel_request',
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "upload_sick_report",
                        "text": "Upload sick report ",
                        "type": "button",
                        "value": email + ";" + vacationId + ";" + fromDate + ";" + toDate + ";" + messageFB

                    }
                ]
            }
        ]
    }
    return message;
}
module.exports.employee_message_manager_vacation_behalf = function employee_message_manager_vacation_behalf(managerEmail, vacationId, fromDate, toDate, type) {
    var message = {
        "text": "Your approver " + managerEmail + " has submited a vacation for you from ( " + fromDate + "-" + toDate + " ).",
        "attachments": [
            {
                "text": ""


            }
        ]
    }

    return message;

}
module.exports.dont_detuct_button_Function = function dont_detuct_button_Function(userEmail, vacationId, approvalId, managerEmail, startDate, endDate, type, workingDays, ImageUrl) {
    var dont_detuct_button = {
        "name": "dont_detuct",
        "text": "Don’t Deduct ",
        "type": "button",
        "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + startDate + ";" + endDate + ";" + type + ";" + workingDays + ";" + ImageUrl
    }

    return dont_detuct_button;
}
module.exports.commentFieldInManagerMessageFunction = function commentFieldInManagerMessageFunction(comment) {
    var commentFieldInManagerMessage = ""
    if (comment != "") {
        commentFieldInManagerMessage = {
            "title": "Comment",
            "value": comment,
            "short": true
        }
    }
    return commentFieldInManagerMessage;
}
/**
 * 
 * Show pending vacation message body
 */
module.exports.sendVacationToManagerFunction = function sendVacationToManagerFunction(comment, ImageUrl, userEmail, startDate, workingDays, endDate, type,
    vacationId, approvalId, managerEmail, managerApprovalMessage, YourActionMessage, vacationState) {
    var type1 = ""
    console.log("sendVacationToManagerFunction" + managerApprovalMessage)
    //vacation type oin words
    type1 = env.vacationType.getVacationType(type)
    var reject_with_comment_button = {
        "name": "reject_with_comment",
        "text": "Reject with comment",
        "style": "danger",
        "type": "button",
        "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + startDate + ";" + endDate + ";" + type + ";" + workingDays + ";" + ImageUrl + ";" + "Pending" + ";" + "Pending" + ";" + "Pending"
    }
    //  managerApprovalMessage = JSON.parse(managerApprovalMessage)

    var dont_detuct_button = env.stringFile.dont_detuct_button_Function(userEmail, vacationId, approvalId, managerEmail, startDate, endDate, type, workingDays, ImageUrl);
    var actions_based_on_type = dont_detuct_button
    if (type == "sick") {

        reject_with_comment_button = ""
        actions_based_on_type = {
            "name": "accept_with_report",
            "text": "Accept with report",

            "type": "button",
            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + startDate + ";" + endDate + ";" + type + ";" + workingDays + ";" + ImageUrl
        }
    }
    var commentFieldInManagerMessage = env.stringFile.commentFieldInManagerMessageFunction(comment);
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
                        "value": type1,
                        "short": true
                    }, {
                        "title": "Your action",
                        "value": YourActionMessage,
                        "short": true
                    },
                    managerApprovalMessage,
                    commentFieldInManagerMessage,

                    {
                        "title": "Final state",
                        "value": "PendingManagerApproval :thinking_face:",
                        "short": false
                    }
                ],
                "actions": [
                    {
                        "name": "confirm",
                        "text": "Accept",
                        "style": "primary",
                        "type": "button",
                        "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + startDate + ";" + endDate + ";" + type + ";" + workingDays + ";" + ImageUrl + ";" + "Pending" + ";" + "Pending" + ";" + "Pending"
                    }, actions_based_on_type,
                    {
                        "name": "reject",
                        "text": "Reject",
                        "style": "danger",
                        "type": "button",
                        "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + startDate + ";" + endDate + ";" + type + ";" + workingDays + ";" + ImageUrl + ";" + "Pending" + ";" + "Pending" + ";" + "Pending"
                    }, reject_with_comment_button,

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
    }
    var stringfy = JSON.stringify(messageBody)
    console.log("stringfy11" + stringfy)
    stringfy = stringfy.replace(/\\/, "")

    stringfy = stringfy.replace(/}\"/g, "}")
    stringfy = stringfy.replace(/\"\{/g, "{")
    stringfy = stringfy.replace(/\\/g, "")
    stringfy = stringfy.replace(/\",\"\"/g, "")
    stringfy = stringfy.replace(/,,/, ",")
    stringfy = stringfy.replace(/,\",/g, ",")
    stringfy = stringfy.replace(/\"\"\",/g, "")
    stringfy = stringfy.replace(/\"\{/g, "{")
    console.log("stringfy1122" + stringfy)
    // stringfy = stringfy.replace(/\\/, "")
    // stringfy = JSON.parse(stringfy)


    return JSON.parse(stringfy);
}
/**
 * Hsitory message
 */
module.exports.historyMessage = function historyMessage(userEmail, startDate,
    workingDays, endDate, type,
    managerApprovalMessage, vacationState, sickConvertedToPersonal) {
    var sickConvertedToPersonalMsg = ""
    var sickConvertedToPersonalEmoji = ""
    if (sickConvertedToPersonal == true) {
        sickConvertedToPersonalEmoji = ":small_blue_diamond: "
        sickConvertedToPersonalMsg = "(Converted from sick )."
    }
    var color = "#439FE0"
    if (vacationState == "Rejected") {
        color = "danger"
    } else if (vacationState == "Approved") {
        color = "good"
    }
    var type1 = env.vacationType.getVacationType(type)

    //"#3AA3E3"//blue

    var messageBody = {
        "text": "",
        "attachments": [
            {
                "attachment_type": "default",
                "callback_id": "manager_confirm_reject",
                "text": "",
                "color": color,
                "fallback": "ReferenceError",
                "fields": [
                    {
                        "title": "From",
                        "value": startDate,
                        "short": true
                    },
                    {
                        "title": "Days/Time ",
                        "value": parseFloat(workingDays).toFixed(2) + " week/s",
                        "short": true
                    },
                    {
                        "title": "to",
                        "value": endDate,
                        "short": true
                    },
                    {
                        "title": "Type",
                        "value": sickConvertedToPersonalEmoji + "" + type1 + " " + sickConvertedToPersonalMsg,
                        "short": true
                    },
                    managerApprovalMessage,



                    {
                        "title": "Final state",
                        "value": vacationState,
                        "short": false
                    }
                ],

            }
        ]
    }
    var stringfy = JSON.stringify(messageBody)
    console.log("stringfy11" + stringfy)
    stringfy = stringfy.replace(/\\/, "")

    stringfy = stringfy.replace(/}\"/g, "}")
    stringfy = stringfy.replace(/\"\{/g, "{")
    stringfy = stringfy.replace(/\\/g, "")
    stringfy = stringfy.replace(/\",\"\"/g, "")
    stringfy = stringfy.replace(/,,/, ",")
    stringfy = stringfy.replace(/,\",/g, ",")
    stringfy = stringfy.replace(/\"\"\",/g, "")
    stringfy = stringfy.replace(/\"\{/g, "{")
    console.log("stringfy1122" + stringfy)
    // stringfy = stringfy.replace(/\\/, "")
    // stringfy = JSON.parse(stringfy)


    return JSON.parse(stringfy);
}
/**
 * Sick report linl
 */
module.exports.sick_report_link = function sick_report_link(vacationId) {
    var sick_report = "<http://46.43.71.50:19090/reports?vId=" + vacationId + "|sick report>"
    return sick_report;
}