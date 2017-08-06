const dateHelper = require('.././DateEngine/DateHelper.js')
const env = require('.././public/configrations.js')
//const leave = require('.././leave.js')



var vacation_type1 = ""
module.exports.vacationWithLeave = function vacationWithLeave(msg, response, emailValue) {
    console.log("response" + response)
    console.log("JSON response" + JSON.stringify(response))
    response = PrepareApiAiResponse(response)

    var other_vacation_types = ""
    var messageText = ""
    var employeeEmail = ""
    dateHelper.getTodayDate(function (today) {

        var time = "8:00:00";
        var time1 = "17:00:00";
        var date = today
        var date1 = today
        var timeOffCase = -1
        if (!(response.result.parameters.email || response.result.parameters.any)) {
            msg.say("please specify the user email with request")
        } else {
            env.mRequests.getUserSlackInfoBySlackId(response.result.parameters.any, function (error, response1, body) {

                if (response.result.parameters.email) {
                    console.log("There is Id")
                    //<mailto:ibrahim.zahra@exalt.ps|ibrahim.zahra@exalt.ps>
                    if ((response.result.parameters.email).indexOf('mailto') > -1) {
                        employeeEmail = response.result.parameters.email
                        employeeEmail = employeeEmail.toString().split('|')
                        employeeEmail = employeeEmail[1];
                        employeeEmail = employeeEmail.replace(/>/g, "");
                        console.log("Email after split mail to " + employeeEmail)
                        // generalEmail = employeeEmail
                        // isInfo = 1
                    }
                    else {
                        console.log("There is email")

                        employeeEmail = response.result.parameters.email
                        console.log("There is email" + employeeEmail)
                        // generalEmail = employeeEmail;
                    }


                } else if (response.result.parameters.any) {
                    //Mention user
                    if (error != 1000) {
                        employeeEmail = body.user.profile.email
                    } else {

                        employeeEmail = response.result.parameters.any
                        employeeEmail = response.result.parameters.any + "@exalt.ps"
                        employeeEmail = employeeEmail.replace(/ /g, ".");
                        console.log("employeeEmail" + employeeEmail)
                    }
                    console.log("response.result.parameters.any " + response.result.parameters.any)




                }
                console.log("response" + JSON.stringify(response))


                if (response.result.parameters.vacation_types) {
                    other_vacation_types = response.result.parameters.vacation_types;
                    if (other_vacation_types == "Wedding")
                        vacation_type1 = "Wedding"
                    else if (other_vacation_types == "Paternity")
                        vacation_type1 = "Paternity"
                    else if (other_vacation_types == "Death") {
                        vacation_type1 = "death"
                    }
                    else if (other_vacation_types == "Wedding") {
                        vacation_type1 = "Marriage"
                    } else if (other_vacation_types == "Maternity") {
                        vacation_type1 = "Maternity"
                    } else if (other_vacation_types == "Sick") {
                        vacation_type1 = "Sick"
                    } else if (other_vacation_types == "WFH") {
                        vacation_type1 = "WFH"
                    }
                    console.log("Other vacation type" + vacation_type1)

                } else vacation_type1 = "Personal"






                if (response.result.parameters.time && response.result.parameters.time1 && response.result.parameters.date && response.result.parameters.date1 && response.result.parameters.date1 != "") {

                    time = response.result.parameters.time
                    time1 = response.result.parameters.time1
                    date = response.result.parameters.date;
                    date1 = response.result.parameters.date1;
                    if (response.result.parameters.date == "") {
                        date = today
                    }
                    timeOffCase = 1

                }
                else if (response.result.parameters.time && response.result.parameters.time1 && response.result.parameters.date1 && response.result.parameters.date1 != "") {

                    time = response.result.parameters.time
                    time1 = response.result.parameters.time1
                    date = response.result.parameters.date1
                    date1 = response.result.parameters.date1
                    if (response.result.parameters.date1 == "") {
                        date = today
                        date1 = today
                    }

                    timeOffCase = 2

                } else if (response.result.parameters.time && response.result.parameters.time1 && response.result.parameters.date) {
                    time = response.result.parameters.time
                    time1 = response.result.parameters.time1
                    date = response.result.parameters.date
                    date1 = response.result.parameters.date
                    if (response.result.parameters.date == "") {
                        date = today
                        date1 = today
                    }
                    timeOffCase = 3

                }

                else if (response.result.parameters.time && response.result.parameters.date && response.result.parameters.date1 && response.result.parameters.date != "" && response.result.parameters.date1 != "") {
                    time = response.result.parameters.time

                    date = response.result.parameters.date
                    date1 = response.result.parameters.date1
                    if (response.result.parameters.date == "") {
                        date = today
                    }
                    timeOffCase = 4

                } else if (response.result.parameters.time && response.result.parameters.time1) {
                    time = response.result.parameters.time
                    time1 = response.result.parameters.time1
                    timeOffCase = 5

                } else if (response.result.parameters.time && response.result.parameters.date && response.result.parameters.date != "") {
                    time = response.result.parameters.time
                    date = response.result.parameters.date
                    date1 = response.result.parameters.date
                    if (response.result.parameters.date == "") {
                        date = today
                        date1 = date
                    }
                    timeOffCase = 6

                }
                else if (response.result.parameters.time && response.result.parameters.date1 && response.result.parameters.date1 != "") {
                    time = response.result.parameters.time
                    date1 = response.result.parameters.date1
                    if (response.result.parameters.date1 == "") {
                        date1 = today
                    }
                    timeOffCase = 7

                }
                else if (response.result.parameters.date && response.result.parameters.date1 && response.result.parameters.date1 != "" && response.result.parameters.date != "") {

                    date = response.result.parameters.date
                    date1 = response.result.parameters.date1
                    timeOffCase = 8

                }
                else if (response.result.parameters.date && response.result.parameters.date != "") {

                    timeOffCase = 9

                    var numberOfDaysToAdd = ""

                    date = response.result.parameters.date
                    date1 = response.result.parameters.date
                    if (response.result.parameters.date == "") {
                        date = today;
                        date1 = date

                    } else if ((response.result.parameters.date).indexOf(',') > -1) {

                        var arr = (response.result.parameters.date).toString().split(',')
                        date = arr[0];
                        date1 = arr[1]
                    }


                }
                else if (response.result.parameters.time) {
                    time = response.result.parameters.time
                    timeOffCase = 10

                }


                if (vacation_type1 == "") {
                    vacation_type1 = "personal"
                }
                console.log("new Api ai response " + JSON.stringify(response))
                console.log("Repeated" + time)
                if (response.result.parameters.vacation_types) {
                    if (vacation_type1 == "Maternity") {
                        numberOfDaysToAdd = 70

                    } else if (response.result.parameters.vacation_types == "Paternity") {
                        numberOfDaysToAdd = 3
                    }
                    else if (response.result.parameters.vacation_types == "Wedding") {
                        numberOfDaysToAdd = 3
                    }
                    else if (response.result.parameters.vacation_types == "Death") {
                        numberOfDaysToAdd = 3
                    } else if (response.result.parameters.vacation_types == "Haj") {
                        numberOfDaysToAdd = 10
                    }
                    var someDate = new Date(date);
                    someDate.setDate(someDate.getDate() + numberOfDaysToAdd);

                    var dd = someDate.getDate();
                    var mm = someDate.getMonth() + 1;
                    var y = someDate.getFullYear();

                    date1 = y + '/' + mm + '/' + dd;
                    timeOffCase = 8
                }
                //get the milliseconds for the  end of the vacation 
                dateHelper.convertTimeFormat(time, function (x, y, convertedTime) {
                    dateHelper.convertTimeFormat(time1, function (x, y, convertedTime1) {
                        console.log("reapeted")
                        var toDate = date1 + " " + convertedTime1

                        var fromDate = date + " " + convertedTime;
                        var timeMilliseconds = new Date(fromDate);
                        var validPreviousDate = 1;

                        if (timeMilliseconds.getFullYear() == 2018) {

                            timeMilliseconds.setFullYear(2017)

                        }
                        timeMilliseconds = timeMilliseconds.getTime();
                        timeMilliseconds = timeMilliseconds - (3 * 60 * 60 * 1000);
                        toDate = new Date(toDate);
                        if (toDate.getFullYear() == 2018) {

                            toDate.setFullYear(2017)

                        }
                        var dateMilliSeconds = toDate.getTime();
                        dateMilliSeconds = dateMilliSeconds - (3 * 60 * 60 * 1000)
                        if (employeeEmail == emailValue) {
                            msg.say("Sorry you can't apply a against rules vacation for you.Please contact your managers")
                        } else {
                            env.VacationConfirmationService.sendVacationWithLeaveConfirmation(msg, convertedTime, date, convertedTime1, date1, timeMilliseconds, dateMilliSeconds, emailValue, employeeEmail, vacation_type1, timeOffCase)

                        }
                        vacation_type1 = ""
                        // else msg.say("Please try again with this foramt mm dd yyyy. I am a bit confused whether you want a vacation in the current year or in next one.")
                    })

                })



            })
        }
    })

}
function PrepareApiAiResponse(response) {
    console.log("response before Preparation" + JSON.stringify(response))
    if (response.result.parameters.date == "" || !response.result.parameters.date)
        response.result.parameters.date = undefined
    if (response.result.parameters.date1 == "" || !response.result.parameters.date1)
        response.result.parameters.date1 = undefined
    if (response.result.parameters.time == "" || !response.result.parameters.time)
        response.result.parameters.time = undefined
    if (response.result.parameters.time1 == "" || !response.result.parameters.time1)
        response.result.parameters.time1 = undefined
    if (response.result.parameters.any == "" || !response.result.parameters.any)
        response.result.parameters.time1 = undefined
    if (response.result.parameters.vacation_types == "" || !response.result.parameters.vacation_types)
        response.result.parameters.time1 = undefined
    console.log("response after Preparation" + JSON.stringify(response))

    return response


}