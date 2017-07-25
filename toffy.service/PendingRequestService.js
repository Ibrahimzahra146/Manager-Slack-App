const env = require('.././public/configrations.js')

module.exports.showManagerPendingRequest = function showManagerPendingRequest(msg, email) {
    var i = 0
    env.mRequests.getUserIdByEmail(email, function (error, response, Id) {

        env.mRequests.getManagerPendingVacation(email, Id, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                if (!(JSON.parse(body)[i])) {
                    msg.say("There are no pending requests");
                }
                else {
                    //build message Json result to send it to slack

                    env.async.whilst(
                        function () { return (JSON.parse(body)[i]) },
                        function (callback) {
                            console.log(JSON.stringify(body))
                            console.log("body[i].id" + (JSON.parse(body))[i].id)
                            console.log("body[i].email" + (JSON.parse(body))[i].employee.email)
                            var userEmail = JSON.parse(body)[i].employee.email;
                            var vacationId = JSON.parse(body)[i].id;
                            var comment = JSON.parse(body)[i].comments;
                            //var approvalId = arr[2]
                            var managerEmail = email
                            // var fromWho = ;
                            var fromDate = JSON.parse(body)[i].fromDate;
                            var toDate = JSON.parse(body)[i].toDate;
                            var type = JSON.parse(body)[i].type
                            var workingDays = JSON.parse(body)[i].period
                            var ImageUrl = JSON.parse(body)[i].employee.profilePicture
                   


                            env.dateHelper.converDateToWords(fromDate, toDate, 0, function (fromDateWord, toDateWord) {
                           

                                env.messageGenerator.generateManagerApprovelsSection(JSON.parse(body)[i].managerApproval, managerEmail, JSON.parse(body)[i].needsSickReport, function (managerApprovalsSection) {
                                    env.VacationHelper.getSecondApproverStateAndFinalState(managerEmail, JSON.parse(body)[i], 1, 1, function (myEmail, myAction, vacationState, approvalId) {
                                        console.log("approvalId" + approvalId)
                                        var messageBody = env.stringFile.sendVacationToManagerFunction(comment, ImageUrl, userEmail, fromDateWord, workingDays, toDateWord, type, vacationId, approvalId, managerEmail, managerApprovalsSection, myAction, vacationState);
                                        msg.say(messageBody)
                                    })
                                })
                                i++

                                //  var message = env.stringFile.pendingVacationMessage(email, JSON.parse(body)[i].id, JSON.parse(body)[i].managerApproval, JSON.parse(body)[i].fromDate, JSON.parse(body)[i].toDate, JSON.parse(body)[i].type, fromDateWord, toDateWord)
                                //  i++
                                // msg.say(message)

                            })

                            setTimeout(callback, 500);

                        },
                        function (err) {
                            // 5 seconds have passed
                        }

                    );


                }

            }

        })
    })
}

