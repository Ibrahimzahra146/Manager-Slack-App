const env = require('./public/configrations.js')


/**
 * 
 * 
 */
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
        "text": "Your approver " + managerEmail + " has submited a vacation for you from " + fromDate + "-" + toDate + ".",
        "attachments": [
            {
                "text": ""


            }
        ]
    }

    return message;

}