const env = require('.././public/configrations.js')


module.exports.sendVacationWithLeaveConfirmation = function sendLeaveSpecTimeSpecDayConfirmation(msg, fromTime, fromDate, toTime, ToDate, fromMilliseconds, toMilliseconds, email, employeeEmail, type, timeOffcase) {
    console.log("sendVacationWithLeaveConfirmation: " + employeeEmail)
    console.log("Type: " + type)
    var holidaysNotice = ""
    var typeNum = ""
    if (type == "Sick") {
        typeNum = 4
    } else if (type == "Maternity")
        typeNum = 2
    else if (type == "Paternity")
        typeNum = 3
    else if (type == "Haj")
        typeNum = 9
    else if (type == "WFH")
        typeNum = 7
    else if (type == "death")
        typeNum = 4
    else if (type == "Wedding")
        typeNum = 8
    else typeNum = 0
    console.log("Type: " + type)

    env.dateHelper.convertTimeFormat(fromTime, function (formattedFromTime, middayFrom, TimeforMilliseconds) {
        env.dateHelper.convertTimeFormat(toTime, function (formattedTime, midday, TimeforMilliseconds1) {
            getWorkingDays(fromMilliseconds, toMilliseconds, email, employeeEmail, typeNum, function (workingPeriod, isValid, reason, containsHolidays, overlappedVacations, body) {
                if (workingPeriod != 1000) {

                    var workingDays = parseFloat(workingPeriod).toFixed(2);
                    if (workingDays != 0.0 || containsHolidays == true) {
                        console.log("overlappedVacations" + overlappedVacations == null)

                        var fromDateServer = new Date(body.timeSlotFrom.date)
                        fromDateServer.setHours(body.timeSlotFrom.hour)
                        fromDateServer.setMinutes(body.timeSlotFrom.minute)
                        //
                        var toDateWordServer = new Date(body.toTimeSlot.date)
                        toDateWordServer.setHours(body.toTimeSlot.hour)
                        toDateWordServer.setMinutes(body.toTimeSlot.minute)

                        env.dateHelper.converDateToWords(fromDateServer, toDateWordServer, 0, function (wordFromDate, wordTodate) {

                            console.log("Type: " + type)

                            getmessage(formattedFromTime, middayFrom, wordFromDate, formattedTime, midday, wordTodate, email, employeeEmail, type, timeOffcase, workingDays, overlappedVacations, function (messagetext) {
                                var addCommentButton = ""
                                if (containsHolidays == true) {
                                    holidaysNotice = env.stringFile.holiday_notice

                                }
                                if (type == "sick") {
                                    // msg.say("Sorry to hear that :(")
                                    // holidaysNotice = ""
                                }
                                if (type == "WFH") {
                                    workingDays = 0
                                    holidaysNotice = ""
                                }

                                messagetext = messagetext + "" + holidaysNotice

                                var text12 = {
                                    "text": "",
                                    "attachments": [
                                        {
                                            "text": messagetext,
                                            "callback_id": 'leave_with_vacation_confirm_reject',
                                            "color": "#3AA3E3",
                                            "attachment_type": "default",
                                            "actions": [
                                                {
                                                    "name": 'confirm',
                                                    "text": "Yes",
                                                    "style": "primary",
                                                    "type": "button",
                                                    "value": fromTime + ";" + toTime + ";" + email + ";" + fromDateServer.getTime() + ";" + toDateWordServer.getTime() + ";" + type + ";" + workingDays + ";" + wordFromDate + ";" + wordTodate + ";" + messagetext + ";" + employeeEmail
                                                },
                                                {
                                                    "name": 'reject',
                                                    "text": "No",
                                                    "style": "danger",
                                                    "type": "button",
                                                    "value": fromTime + ";" + toTime + ";" + email + ";" + fromDateServer.getTime() + ";" + toDateWordServer.getTime() + ";" + type + ";" + workingDays + ";" + wordFromDate + ";" + wordTodate + ";" + messagetext + ";" + employeeEmail
                                                }

                                            ],
                                        }
                                    ]
                                }
                                msg.say(text12)
                            })
                            //else vacationOverllaping.determinOverllapingCase(msg, email, overlappedVacations, messagetext, holidaysNotice, fromTime, toTime, email, fromMilliseconds, toMilliseconds, type, workingDays, )

                        })

                    }
                    else msg.say("It's already a time off.")
                } else msg.say("Sorry! I am a bit confused :white_frowning_face:")
            })


        });


    })
}



function getWorkingDays(startDate, endDate, email, employeeEmail, typeNum, callback) {


    try {
        env.managerToffyHelper.getIdFromEmail(email, employeeEmail, function (Id) {
            var vacationBody = {
                "employee_id": Id,
                "from": startDate,
                "to": endDate,
                "type": typeNum

            }
            console.log("getWorkingDays" + JSON.stringify(vacationBody))
            vacationBody = JSON.stringify(vacationBody)
            env.request({
                url: "http://" + env.IP + "/api/v1/vacation/working-days", //URL to hitDs
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': env.managerToffyHelper.general_remember_me + ";" + env.managerToffyHelper.general_session_id
                },
                body: vacationBody
                //Set the body as a stringcc
            }, function (error, response, body) {

                //console.log(" (JSON.parse(body)).validRequest.reason" + (JSON.parse(body)).validRequest.reason)
                if (response.statusCode == 500) {
                    callback(1000, "no ")
                } else if (response.statusCode == 400)
                    callback(1000, "no ")
                else if ((JSON.parse(body)).validRequest.overlappedVacations) {
                    console.log("overllaped vacation" + JSON.stringify(body))
                    callback((JSON.parse(body)).workingPeriod, (JSON.parse(body)).validRequest.isValid, (JSON.parse(body)).validRequest.reason, (JSON.parse(body)).validRequest.containsHolidays, (JSON.parse(body)).validRequest.overlappedVacations, (JSON.parse(body)))

                }
                else {
                    console.log("no overllaped vacation" + JSON.stringify(body))
                    console.log()
                    callback((JSON.parse(body)).workingPeriod, (JSON.parse(body)).validRequest.isValid, (JSON.parse(body)).validRequest.reason, (JSON.parse(body)).validRequest.containsHolidays, "", (JSON.parse(body)))

                }
            })

        })
    } catch (error) {
        console.log("Error:" + error)

    }



}
function getmessage(formattedFromTime, middayFrom, fromDate, formattedTime, midday, ToDate, email, employeeEmail, type, timeOffcase, workingDays, overlappedVacations, callback) {
    console.log("getmessage" + type)
    var typeText = "Okay, you asked for a time off for " + employeeEmail
    if (type == "Sick") {
        typeText = " you asked for a sick" + " time off for " + employeeEmail + " :persevere:,"
    } else if (type == "Maternity") {
        typeText = " you asked for a *Maternity*" + " time off for " + employeeEmail
    } else if (type == "Paternity") {
        typeText = " you asked for a *Paternity*" + " time off for " + employeeEmail

    } else if (type == "WFH")
        typeText = "You asked for " + employeeEmail + " to work from home"
    else if (type == "Death")
        typeText = "You asked *Death* time off for " + employeeEmail
    else if (type == "Wedding")
        typeText = "You asked for a *Marriage* time off for " + employeeEmail
    else if (type == "Haj")
        typeText = "You asked for a *Haj* time off for " + employeeEmail
    var messageText = ""
    generateOverllapedVacationsMessae(overlappedVacations, function (overlppedMsg) {




        messageText = typeText + " from  " + fromDate + " to " + ToDate + " and that would be " + workingDays + " working days. " + overlppedMsg + ". Should I go ahead ?"


        if (timeOffcase == 8) {
            if (type == "WFH") {
                messageText = ""
                messageText = typeText + " from  " + fromDate + " to " + ToDate + ". Should I go ahead ?"

            } else
                messageText = typeText + " from  " + fromDate + " to " + ToDate + " and that would be " + workingDays + " working days. " + overlppedMsg + ". Should I go ahead ?"


        } else if (timeOffcase == 9) {
            if (type == "WFH") {
                messageText = ""
                messageText = typeText + " from  " + fromDate + " to " + ToDate + ". Should I go ahead ?"
            } else
                messageText = typeText + " on " + fromDate + " to " + ToDate + " and that would be " + workingDays + " working day. " + overlppedMsg + " Should I go ahead ? "


        } else if (timeOffcase == 11) {

        } else if (timeOffcase == 12) {

        }

        callback(messageText)
    })

}
function generateOverllapedVacationsMessae(overlappedVacations, callback) {
    var overlppedMsg = ""
    if (overlappedVacations != "") {
        var i = 0
        while (overlappedVacations[i]) {
            if (overlppedMsg != "")
                overlppedMsg = overlppedMsg + " and "
            env.dateHelper.converDateToWords(overlappedVacations[i].fromDate, overlappedVacations[i].toDate, 0, function (fromDateWord, toDateWord) {
                overlppedMsg = overlppedMsg + " from " + fromDateWord + " to " + toDateWord
            })

            i++;
        }
        console.log("overlppedMsg::" + overlppedMsg)
        overlppedMsg = "\n[Note]: There is an already taken time off " + overlppedMsg + " and it will be overwritten when you press \"Yes\"."
        callback(overlppedMsg)
    } else callback(overlppedMsg)

}
