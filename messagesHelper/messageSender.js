const env = require('.././public/configrations.js')

var IP = process.env.SLACK_IP
module.exports.sendMessagetoEmpOnAction = function sendMessagetoEmpOnAction(msg, managerEmail, fromDate, toDate, userEmail, type, bot, approvalType, body, typeText, responseBody, comment1) {
    var managerFeedbackmessage = ""
    var userFeedbackmessage = ""
    var comment = ""
    if (comment1 != "") {
        comment = "Approver comment: " + comment1
    }

    if (approvalType == "ApprovedWithoutDeduction") {
        if ((JSON.parse(body)).vacationState == "Rejected") {
            userFeedbackmessage = "The approver " + managerEmail + " has accepted your time off request without detuction ( " + fromDate + " - " + toDate + " ). Your time off is rejected. "
        } else if ((JSON.parse(body)).vacationState == "Approved") {
            userFeedbackmessage = "The approver " + managerEmail + " has accepted your time off request without detuction ( " + fromDate + " - " + toDate + " ). Your time off is approved.  "
        } else if ((JSON.parse(body)).vacationState == "ApprovedWithoutDeduction") {
            userFeedbackmessage = "The approver " + managerEmail + " has accepted your time off request without detuction ( " + fromDate + " - " + toDate + " ). Your time off is approved but without detuction. "


        } else userFeedbackmessage = "The approver " + managerEmail + " has accepted your time off request without detuction ( " + fromDate + " - " + toDate + " ).Please wait other approvers to take an action. "

        managerFeedbackmessage = "You have accepted the" + typeText + " request but without detuction for " + userEmail + " ( " + fromDate + "-" + toDate + " )."
        //  msg.say(managerFeedbackmessage)
    } else if (approvalType == "Approved") {
        if (type == "WFH") {
            userFeedbackmessage = "The approver " + managerEmail + " has Approved your working from home request ( " + fromDate + " - " + toDate + " )."
        }

        else if ((JSON.parse(body)).vacationState == "Rejected") {
            userFeedbackmessage = "The approver " + managerEmail + " has Approved your time off ( " + fromDate + " - " + toDate + " ). Your time off is rejected.\n" + comment
        } else if ((JSON.parse(body)).vacationState == "Approved") {
            userFeedbackmessage = "The approver " + managerEmail + " has Approved your time off request ( " + fromDate + " - " + toDate + " ). Your time off is approved.\n " + comment
        } else if ((JSON.parse(body)).vacationState == "ApprovedWithoutDeduction") {
            userFeedbackmessage = "The approver " + managerEmail + " has Approved your time off request ( " + fromDate + " - " + toDate + " ). Your time off is approved but without detuction.\n" + comment


        } else userFeedbackmessage = "The approver " + managerEmail + " has Approved your time off request ( " + fromDate + " - " + toDate + " ).Please wait other approvers to take an action.\n " + comment

        managerFeedbackmessage = "You have accepted the" + typeText + " for " + userEmail + " ( " + fromDate + "-" + toDate + " )."
        // msg.say(managerFeedbackmessage)


    } else if (approvalType == "Rejected") {
        if (type == "WFH") {
            userFeedbackmessage = "The approver " + managerEmail + " has rejected your working from home request ( " + fromDate + " - " + toDate + " ).\n" + comment
        }
        else if ((JSON.parse(body)).vacationState == "Rejected") {
            userFeedbackmessage = "The approver " + managerEmail + " has rejected your time off ( " + fromDate + " - " + toDate + " ). Your time off is rejected.\n " + comment
        } else if ((JSON.parse(body)).vacationState == "Approved") {
            userFeedbackmessage = "The approver " + managerEmail + " has rejected your time off request ( " + fromDate + " - " + toDate + " ). Your time off is approved.\n " + comment
        } else if ((JSON.parse(body)).vacationState == "ApprovedWithoutDeduction") {
            userFeedbackmessage = "The approver " + managerEmail + " has rejected your time off request ( " + fromDate + " - " + toDate + " ). Your time off is approved but withoit detuction.\n " + comment


        } else userFeedbackmessage = "The approver " + managerEmail + " has rejected your time off request ( " + fromDate + " - " + toDate + " ).Please wait other approvers to take an action.\n " + comment

        managerFeedbackmessage = "You have rejected the" + typeText + " for " + userEmail + " ( " + fromDate + "-" + toDate + " )."
        //msg.say(managerFeedbackmessage)



    }
    var message = {
        'type': 'message',
        'channel': responseBody.userChannelId,
        user: responseBody.slackUserId,
        text: 'what is my name',
        ts: '1482920918.000057',
        team: responseBody.teamId,
        event: 'direct_message'
    };
    bot.startConversation(message, function (err, convo) {


        if (!err) {
            var text12 = {
                "text": userFeedbackmessage,
            }
            var stringfy = JSON.stringify(text12);
            var obj1 = JSON.parse(stringfy);
            bot.reply(message, obj1);

        }

    });
}
module.exports.SendNotificationToSecondManagerOnManagerBehalfVacation = function SendNotificationToSecondManagerOnManagerBehalfVacation(employeeEmail, fromDate, toDate, email, type, vacationId, managerApproval, workingDays) {
    var i = 0
    var managerEmail = ""
    while (managerApproval[i]) {

        managerEmail = managerApproval[i].managerEmail
        if (managerEmail != email) {
            env.mRequests.getSlackRecord(managerEmail, function (error, response, body) {
                var jsonResponse = JSON.parse(body);
                var slack_Message = env.stringFile.slack_message(jsonResponse.managerChannelId, jsonResponse.slackUserId, jsonResponse.teamId);
                var message = "Hi,Approver " + managerEmail + "has submitted vacattion for " + employeeEmail + "from " + fromDate + " to " + toDate
                env.bot.startConversation(slack_Message, function (err, convo) {
                    if (!err) {

                        var stringfy = JSON.stringify(message);
                        var obj1 = JSON.parse(stringfy);

                        env.bot.reply(slack_Message, obj1, function (err, response) {
                        });

                    } else {
                    }

                });
            })
        }
        i++;
    }
}
module.exports.sendFeedBackToEmpOnManagerBehalfFeedback = function sendFeedBackToEmpOnManagerBehalfFeedback(employeeEmail, fromDate, toDate, managerEmail, type, vacationId, managerApproval, workingDays) {
    env.mRequests.getSlackRecord(employeeEmail, function (error, response, body) {
        var responseBody = JSON.parse(body);
        var slack_message = env.stringFile.slack_message(responseBody.userChannelId, responseBody.slackUserId, responseBody.teamId)
        feedback_message_to_emp = env.stringFile.employee_message_manager_vacation_behalf(managerEmail, vacationId, fromDate, toDate, type)


        env.bot.startConversation(slack_message, function (err, convo) {

            if (!err) {
                var stringfy = JSON.stringify(feedback_message_to_emp);
                var obj1 = JSON.parse(stringfy);
                env.bot.reply(slack_message, obj1);

            }
        });

    })
}
