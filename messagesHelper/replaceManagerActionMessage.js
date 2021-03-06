const request = require('request');
var managerHelper = require('.././managerToffyHelper.js')
var server = require('.././server.js')
var sessionFlag = 0;
var generalCookies = "initial"
var IP = process.env.SLACK_IP
const env = require('.././public/configrations.js')
module.exports.replaceMessage = function replaceMessage(msg, userEmail, managerEmail, fromDate, toDate, type, approvalType, vacationId, approvalId, ImageUrl, typeText, workingDays,
    managerApprovalsSection, vacationState, comment, sickReport) {
    var sick_report_field = ""

    console.log("sickReport" + sickReport)
    if (sickReport == 1) {
        sick_report_field =
            {
                "title": "Sick report ",
                "value": env.stringFile.sick_report_link(vacationId),
                "short": false

            }
    }

    console.log("Comment" + comment)
    var commentField = ""
    if (comment != null && comment != "") {
        commentField =
            {
                "title": "Comment ",
                "value": comment,
                "short": false

            }
    }
    getEmoji("", vacationState, type, approvalType, function (approverActionEmoji, finalStateEmoji, typeEmoji, myActionEmoji) {

        var messageBody = {
            "text": "Time off request:",
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
                            "value": type + " " + typeEmoji,
                            "short": true
                        }
                        ,
                        {
                            "title": "Your action ",
                            "value": approvalType + " " + myActionEmoji,
                            "short": true
                        }

                        ,
                        managerApprovalsSection
                        , commentField,
                        sick_report_field,

                        {
                            "title": "Final state",
                            "value": vacationState + " " + finalStateEmoji,
                            "short": false
                        }

                    ],
                    "actions": [
                        {
                            "name": "Undo",
                            "text": "back",
                            "type": "button",

                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        }, {
                            "name": "check_state_undo",
                            "text": ":arrows_counterclockwise:",

                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        },
                    ],
                    "color": "#F35A00",
                    "thumb_url": ImageUrl,
                }
            ]
        }


        prepareMessage(messageBody, function (stringfy) {
            msg.respond(msg.body.response_url, stringfy)
        })
    })
}
//return original message when click on undo
module.exports.undoAction = function unduAction(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays, managerApprovalsSection,
    vacationState, myAction, comment, sickReport) {
    var sick_report_field = ""

    console.log("sickReport" + sickReport)
    if (sickReport == 1) {
        sick_report_field =
            {
                "title": "Sick report ",
                "value": env.stringFile.sick_report_link(vacationId),
                "short": false

            }
    }

    //console.log("undoAction1" + undoAction)
    var commentField = ""
    if (comment != null && comment != "") {
        commentField =
            {
                "title": "Comment ",
                "value": comment,
                "short": false

            }
    }
    getEmoji("", vacationState, type, myAction, function (approverActionEmoji, finalStateEmoji, typeEmoji, myActionEmoji) {
        var reject_with_comment_button = {
            "name": "reject_with_comment",
            "text": "Reject with comment",
            "style": "danger",
            "type": "button",
            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl + ";" + "Pending" + ";" + "Pending" + ";" + "Pending"
        }
        var dont_detuct_button = {
            "name": "dont_detuct",
            "text": "Don’t Deduct ",
            "type": "button",
            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
        }
        var dont_detuct_button = ""
        if (type == "WFH") {
            dont_detuct_button = ""
            reject_with_comment_button = ""
        }
        var actions_based_on_type = dont_detuct_button
        if (type == "sick") {
            reject_with_comment_button = ""
            actions_based_on_type = {
                "name": "accept_with_report",
                "text": "Accept with report",

                "type": "button",
                "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
            }
        }
        var messageBody = {
            "text": "Time off request:",
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
                            "value": type + " " + typeEmoji,
                            "short": true
                        }
                        ,
                        {
                            "title": "Your action ",
                            "value": myAction + " " + myActionEmoji,
                            "short": true
                        }
                        ,
                        managerApprovalsSection,
                        commentField,
                        sick_report_field,
                        {
                            "title": "Final state",
                            "value": vacationState + " " + finalStateEmoji,
                            "short": false
                        }

                    ],
                    "actions": [
                        {
                            "name": "confirm",
                            "text": "Accept",
                            "style": "primary",
                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        }, actions_based_on_type,
                        {
                            "name": "reject",
                            "text": "Reject",
                            "style": "danger",
                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        }, reject_with_comment_button,

                        {
                            "name": "check_state",
                            "text": ":arrows_counterclockwise:",

                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        },
                    ],
                    "color": "#F35A00",
                    "thumb_url": ImageUrl,
                }
            ]
        }
        prepareMessage(messageBody, function (stringfy) {
            msg.respond(msg.body.response_url, stringfy)
        })
    })
}

module.exports.replaceWithComment = function replaceWithComment(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays, managerApprovalsSection,
    vacationState, myAction, comment, sickReport) {
    var sick_report_field = ""

    console.log("sickReport" + sickReport)
    if (sickReport == 1) {
        sick_report_field =
            {
                "title": "Sick report ",
                "value": env.stringFile.sick_report_link(vacationId),
                "short": false

            }
    }
    var commentField = ""
    if (comment != null && comment != "") {
        commentField =
            {
                "title": "Comment ",
                "value": comment,
                "short": false

            }
    }
    getEmoji("", vacationState, type, myAction, function (approverActionEmoji, finalStateEmoji, typeEmoji, myActionEmoji) {

        var dont_detuct_button = ""

        var messageBody = {
            "text": "Time off request:",
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
                            "value": type + " " + typeEmoji,
                            "short": true
                        }
                        ,
                        {
                            "title": "Your action ",
                            "value": myAction + " " + myActionEmoji,
                            "short": true
                        }
                        , managerApprovalsSection,
                        commentField,
                        sick_report_field,

                        {
                            "title": "Final state",
                            "value": vacationState + " " + finalStateEmoji,
                            "short": false
                        }
                    ],
                    "actions": [
                        {
                            "name": "Send_comment",
                            "text": "Sorry",

                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl + ";Sorry!."
                        },
                        {
                            "name": "Send_comment",
                            "text": "Project deadline",

                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl + ";Project deadline."
                        },

                        {
                            "name": "Send_comment",
                            "text": "Discuss it privately",

                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl + ";Discuss it privately."
                        },
                        {
                            "name": "Send_comment",
                            "text": "No replaceable emp",
                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl + ";No replaceable emp."
                        }, {
                            "name": "Undo",
                            "text": "back",

                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        }

                    ],
                    "color": "#F35A00",
                    "thumb_url": ImageUrl,
                }
            ]
        }
        prepareMessage(messageBody, function (stringfy) {
            msg.respond(msg.body.response_url, stringfy)
        })
    })
}

/**
 * Refresh the current message
 */

module.exports.replaceCanceledRequestOnAction = function replaceCanceledRequestOnAction(msg, userEmail, managerEmail, fromDate, toDate, type,
    vacationId, approvalId, ImageUrl, workingDays, sickReport) {
    var sick_report_field = ""

    console.log("sickReport" + sickReport)
    if (sickReport == 1) {
        sick_report_field =
            {
                "title": "Sick report ",
                "value": env.stringFile.sick_report_link(vacationId),
                "short": false

            }
    }

    var messageBody = {
        "text": "Time off request:",
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
                    ,
                    {
                        "title": "State",
                        "value": "Cancelled by employee :no_entry_sign:",
                        "short": true
                    }, sick_report_field
                ],

                "color": "#F35A00",
                "thumb_url": ImageUrl,
            }
        ]
    }
    msg.respond(msg.body.response_url, messageBody)
}
/**
 * Check state of not canceled request
 * 
 */
module.exports.replaceMessageOnCheckState = function replaceMessageOnCheckState(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays,
    managerApprovalsSection, vacationState, myAction, comment, sickReport) {
    var commentField = ""
    var sick_report_field = ""

    console.log("sickReport" + sickReport)
    if (sickReport == 1) {
        sick_report_field =
            {
                "title": "Sick report ",
                "value": env.stringFile.sick_report_link(vacationId),
                "short": false

            }
    }
    if (comment != null && comment != "") {
        commentField =
            {
                "title": "Comment ",
                "value": comment,
                "short": false

            }
    }
    getEmoji("", vacationState, type, myAction, function (approverActionEmoji, finalStateEmoji, typeEmoji, myActionEmoji) {

        var reject_with_comment_button = {
            "name": "reject_with_comment",
            "text": "Reject with comment",
            "style": "danger",
            "type": "button",
            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl + ";" + "Pending" + ";" + "Pending" + ";" + "Pending"
        }
        var dont_detuct_button = {
            "name": "dont_detuct",
            "text": "Don’t Deduct ",
            "type": "button",
            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
        }

        if (type == "WFH") {
            dont_detuct_button = ""
            reject_with_comment_button = ""
        }

        var actions_based_on_type = dont_detuct_button
        if (type == "sick") {
            reject_with_comment_button = ""
            actions_based_on_type = {
                "name": "accept_with_report",
                "text": "Accept with report",

                "type": "button",
                "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
            }
        }

        console.log("replaceMessageOnCheckState")
        var messageBody = {
            "text": "Time off request:",
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
                            "value": type + " " + typeEmoji,
                            "short": true
                        }
                        ,
                        {
                            "title": "Your action ",
                            "value": myAction + " " + myActionEmoji,
                            "short": true
                        }
                        ,
                        managerApprovalsSection,
                        commentField,
                        sick_report_field,
                        {
                            "title": "Final state",
                            "value": vacationState + " " + finalStateEmoji,
                            "short": false
                        }

                    ], "actions": [
                        {
                            "name": "confirm",
                            "text": "Accept",
                            "style": "primary",
                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        }, actions_based_on_type,
                        {
                            "name": "reject",
                            "text": "Reject",
                            "style": "danger",
                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        }, reject_with_comment_button,


                        {
                            "name": "check_state",
                            "text": ":arrows_counterclockwise:",

                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        },
                    ],

                    "color": "#F35A00",
                    "thumb_url": ImageUrl,
                }
            ]
        }
        prepareMessage(messageBody, function (stringfy) {
            msg.respond(msg.body.response_url, stringfy)
        })
    })
}
/**
 * 
 * 
 * Already rejected vacation 
 */
module.exports.replaceAlreadyRejectedVacation = function replaceAlreadyRejectedVacationovalIde(msg, userEmail, managerEmail, fromDate, toDate, type, approvalType, vacationId, approvalId, ImageUrl, typeText,
    workingDays, managerApprovalsSection, vacationState, comment, sickReport) {

    var sick_report_field = ""

    console.log("sickReport" + sickReport)
    if (sickReport == 1) {
        sick_report_field =
            {
                "title": "Sick report ",
                "value": env.stringFile.sick_report_link(vacationId),
                "short": false

            }
    }
    var messageBody = {
        "text": "Time off request:",
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
                    ,
                    {
                        "title": "State",
                        "value": "Rejected",
                        "short": true
                    }, sick_report_field
                ],

                "color": "#F35A00",
                "thumb_url": ImageUrl,
            }
        ]
    }
    msg.respond(msg.body.response_url, messageBody)
}
/**
 * 
 * 
 */
module.exports.replaceRejectedConfirmation = function replaceRejectedConfirmation(msg, userEmail, managerEmail, fromDate, toDate, type, approvalType, vacationId,
    approvalId, ImageUrl, typeText, workingDays,
    managerApprovalsSection, vacationState, comment, sickReport) {
    var sick_report_field = ""

    console.log("sickReport" + sickReport)
    if (sickReport == 1) {
        sick_report_field =
            {
                "title": "Sick report ",
                "value": env.stringFile.sick_report_link(vacationId),
                "short": false

            }
    }
    console.log("Comment" + comment)
    var commentField = ""
    if (comment != null && comment != "") {
        commentField =
            {
                "title": "Comment ",
                "value": comment,
                "short": false

            }
    }
    getEmoji("", vacationState, type, approvalType, function (approverActionEmoji, finalStateEmoji, typeEmoji, myActionEmoji) {

        var messageBody = {
            "text": "Time off request:",
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
                            "value": type + " " + typeEmoji,
                            "short": true
                        }
                        ,
                        {
                            "title": "Your action ",
                            "value": approvalType + " " + myActionEmoji,
                            "short": true
                        }
                        ,
                        managerApprovalsSection
                        , commentField,
                        sick_report_field,

                        {
                            "title": "Final state",
                            "value": vacationState + " " + finalStateEmoji,
                            "short": false
                        },
                        {
                            "title": "[Note]",
                            "value": "The rejection of this sick time off request will convert it automatically to deducted personal time off. Please note that this action cannot be UNDONE!"
                            ,
                            "short": false
                        }


                    ],
                    "actions": [
                        {
                            "name": "Rejected_Conf",
                            "text": "Yes",

                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        },
                        {
                            "name": "Undo",
                            "text": "No",
                            "type": "button",
                            "style": "danger",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        },
                    ],
                    "color": "#F35A00",
                    "thumb_url": ImageUrl,
                }
            ]
        }


        prepareMessage(messageBody, function (stringfy) {
            msg.respond(msg.body.response_url, stringfy)
        })
    })


}
//
function getEmoji(state, finalState, type, myAction, callback) {
    var approverActionEmoji = ":thinking_face:"
    var typeEmoji = ""
    var finalStateEmoji = ":thinking_face:"
    var myActionEmoji = ":thinking_face:"
    if (state == "--") {
        var approverActionEmoji = ""

    }
    if (state == "Rejected") {
        approverActionEmoji = ":no_entry_sign:"
    } else if (state == "Approved") {
        approverActionEmoji = ":white_check_mark:"
    } else if (state == "ApprovedWithoutDeduction") {
        approverActionEmoji = "::eight_spoked_asterisk::"
    } else if (state == "ApprovedWithReport") {
        approverActionEmoji = " :memo:"
    }

    if (type == "sick") {
        typeEmoji = ":ambulance:"
    }

    if (finalState == "Rejected") {
        finalStateEmoji = ":no_entry_sign:"
    } else if (finalState == "Approved") {
        finalStateEmoji = ":white_check_mark:"
    } else if (finalState == "ApprovedWithoutDeduction") {
        finalStateEmoji = "::eight_spoked_asterisk::"
    } else if (finalState == "ApprovedButNeedsReport") {
        finalStateEmoji = ":memo:"
    }


    if (myAction == "Rejected") {
        myActionEmoji = ":no_entry_sign:"
    } else if (myAction == "Approved") {
        myActionEmoji = ":white_check_mark:"
    }
    else if (myAction == "ApprovedWithoutDeduction") {
        myActionEmoji = ":eight_spoked_asterisk:"
    } else if (myAction == "ApprovedWithReport") {
        myActionEmoji = " :memo:"
    }


    callback(approverActionEmoji, finalStateEmoji, typeEmoji, myActionEmoji)

}
//prepare message
function prepareMessage(messageBody, callback) {
    var stringfy = JSON.stringify(messageBody)
    stringfy = stringfy.replace(/\\/, "")

    stringfy = stringfy.replace(/}\"/g, "}")
    stringfy = stringfy.replace(/\"\{/g, "{")
    stringfy = stringfy.replace(/\\/g, "")
    stringfy = stringfy.replace(/\",\"\"/g, "")
    stringfy = stringfy.replace(/,,/, ",")
    stringfy = stringfy.replace(/\"\{/g, "{")
    console.log("stringfy11" + stringfy)
    stringfy = stringfy.replace(/,\",{/g, ",")
    stringfy = stringfy.replace(/},\"/g, "},{\"")
    stringfy = stringfy.replace(/{\"\"\",/g, "")
    stringfy = stringfy.replace(/{\",/g, "{")
    stringfy = stringfy.replace(/{\"\",/g, "")

    console.log("stringfy2" + stringfy)

    stringfy = JSON.parse(stringfy)
    callback(stringfy)
}


