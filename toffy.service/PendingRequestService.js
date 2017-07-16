const env = require('.././public/configrations.js')

module.exports.showManagerPendingRequest = function showManagerPendingRequest(msg, email) {
    var i = 0
    env.mRequests.getUserIdByEmail(email, function (error, response, Id) {

        env.mRequests.getManagerPendingVacation(email, Id, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                if (!(body)[i]) {
                    msg.say("There are nopending requests");
                }
                else {
                    //build message Json result to send it to slack
                    while ((JSON.parse(body)[i])) {

                        console.log("body[i].id" + (JSON.parse(body))[i].id)
                        console.log("body[i].email" + (JSON.parse(body))[i].employee.email)
                        env.dateHelper.converDateToWords(JSON.parse(body)[i].fromDate, JSON.parse(body)[i].toDate, 0, function (fromDateWord, toDateWord) {

                            env.messageGenerator.generateManagerApprovelsSection(JSON.parse(body[i]).managerApproval, managerEmail, JSON.parse(body[i]).needsSickReport, function (managerApprovalsSection) {
                                env.VacationHelper.getSecondApproverStateAndFinalState(managerEmail, body[i], 1, function (myEmail, myAction, vacationState) {
                                })
                            })
                            var message = env.stringFile.pendingVacationMessage(email, JSON.parse(body)[i].id, JSON.parse(body)[i].managerApproval, JSON.parse(body)[i].fromDate, JSON.parse(body)[i].toDate, JSON.parse(body)[i].type, fromDateWord, toDateWord)
                            i++
                            msg.say(message)
                        })
                    }
                }
            }

        })
    })
}

