const env = require('./public/configrations.js')


/**
 * 
 * 
 */
module.exports.manager_message_on_accept_with_report = function manager_message_on_accept_with_report(email, fromDate, toDate) {
    var message = "Your manager " + email + " asked you to submitt a sick report for your sick time from ( " + fromDate + "-" + toDate + " )";
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
module.exports.upload_sick_report_message = function cancelationButton(email, vacationId, fromDate, toDate, type) {
    var message = {
        "text": "",
        "attachments": [
            {
                "text": env.stringFile.manager_message_on_accept_with_report(email, fromDate, toDate),
                "callback_id": 'cancel_request',
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "upload_sick_report",
                        "text": "Upload sick report ",
                        "type": "button",
                        "value": email + ";" + vacationId + ";" + fromDate + ";" + toDate 

                    }
                ]
            }
        ]
    }
    return message;
}