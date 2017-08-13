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


                if (response.result.action == "timeoff.date_period") {

                    var date_period = response.result.parameters.date_period
                    var arr = date_period.toString().split('/')
                    date = arr[0]
                    date1 = arr[1]
                }
                else if (response.result.action == "timeoff.time_period") {
                    if (response.result.parameters.date && response.result.parameters.time_period) {
                        date = response.result.parameters.date
                        date1 = response.result.parameters.date
                        var time_period = response.result.parameters.time_period;
                        var arr = time_period.toString().split('/')
                        time = arr[0]
                        time1 = arr[1]
                    } else if (response.result.parameters.time_period) {
                        var time_period = response.result.parameters.time_period;
                        var arr = time_period.toString().split('/')
                        time = arr[0]
                        time1 = arr[1]
                    }

                } else if (response.result.action == "timeoff.date_time") {



                    if (response.result.parameters.date_time) {
                        if ((response.result.parameters.date_time).indexOf("T") > -1) {


                            var date_time = response.result.parameters.date_time;
                            var arr = date_time.toString().split('T')
                            date = arr[0]
                            date1 = date
                            arr = arr[1].toString().split('Z')
                            time = arr[0]
                        } else if ((response.result.parameters.date_time).indexOf("/") > -1) {

                            var date_time = response.result.parameters.date_time;
                            var arr = date_time.toString().split('/')
                            console.log("date_time")

                            var d = new Date(arr[0]);
                            console.log(d.toString() === 'Invalid Date')
                            time = arr[0]
                            time1 = arr[1]
                        } else date = response.result.parameters.date_time
                    } else if (response.result.parameters.time) {
                        time = response.result.parameters.time
                    }


                }




                if (vacation_type1 == "") {
                    vacation_type1 = "personal"
                }
                console.log("new Api ai response " + JSON.stringify(response))
                console.log("Repeated" + time)
                if (response.result.parameters.vacation_types) {
                    console.log("Arrive vacation_types1")
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
                    } else if (response.result.parameters.vacation_types == "Sick") {
                        numberOfDaysToAdd = 0
                    }
                    var someDate = new Date(date);
                    if (response.result.parameters.date_period == undefined) {
                        console.log("Arrive vacation_types2")

                        someDate.setDate(someDate.getDate() + numberOfDaysToAdd);

                        var dd = someDate.getDate();
                        var mm = someDate.getMonth() + 1;
                        var y = someDate.getFullYear();

                        date1 = y + '/' + mm + '/' + dd;
                        console.log("Arrive vacation_types3" + date1)

                    }

                }
                console.log("timeOffCase" + timeOffCase)
                //get the milliseconds for the  end of the vacation 
                dateHelper.convertTimeFormat(time, function (x, y, convertedTime) {
                    dateHelper.convertTimeFormat(time1, function (x, y, convertedTime1) {
                        console.log("reapeted")
                        var toDate = date1 + " " + convertedTime1
                        console.log("toDate" + toDate)

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
    if (response.result.parameters.date_period == "" || !response.result.parameters.date_period)
        response.result.parameters.date_period = undefined
    if (response.result.parameters.time == "" || !response.result.parameters.time)
        response.result.parameters.time = undefined
    if (response.result.parameters.time_period == "" || !response.result.parameters.time_period)
        response.result.parameters.time_period = undefined
    if (response.result.parameters.any == "" || !response.result.parameters.any)
        response.result.parameters.any = undefined
    if (response.result.parameters.vacation_types == "" || !response.result.parameters.vacation_types)
        response.result.parameters.vacation_types = undefined
    if (response.result.parameters.date_time == "" || !response.result.parameters.date_time)
        response.result.parameters.date_time = undefined
    console.log("response after Preparation" + JSON.stringify(response))

    return response


}