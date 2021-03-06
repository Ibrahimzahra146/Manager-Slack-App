const request = require('request');
var managerToffyHelper = require('.././managerToffyHelper.js')
var server = require('.././server.js')
var sessionFlag = 0;
var generalCookies = "initial"
var IP = process.env.SLACK_IP
var employee = require(".././employeeSide.js")
const env = require('./configrations.js')
module.exports.whoIsOff = function whoIsOff(msg, response, email) {
    managerToffyHelper.getTodayDate(function (today) {
        var time = "00:00:00";
        var time1 = "17:59:59";

        var date = today
        var date1 = today
        var fromDateMilli = ""
        var toDateMilli = ""
        var employeeEmail = ""
        var type = 0
        if (response.result.parameters.in_off == "wfh")
            type = 7
        if (response.result.parameters.in_off == "sick")
            type = 4

        if (response.result.parameters.question != "is" && response.result.parameters.in_off && response.result.parameters.date && response.result.parameters.date1) {
            console.log("Case1")
            date = response.result.parameters.date
            date1 = response.result.parameters.date1
        } else if (response.result.parameters.question != "is" && response.result.parameters.in_off && response.result.parameters.date) {
            console.log("Case2")
            date = response.result.parameters.date
            date1 = response.result.parameters.date
        } else if (response.result.parameters.question == "is" && response.result.parameters.in_off && response.result.parameters.date && response.result.parameters.any) {
            employeeEmail = response.result.parameters.any + "@exalt.ps"
            employeeEmail = employeeEmail.replace(/ /g, ".");
            console.log("Case3")
            date = response.result.parameters.date
        } else if (response.result.parameters.question == "is" && response.result.parameters.in_off && response.result.parameters.any) {
            employeeEmail = response.result.parameters.any + "@exalt.ps"
            employeeEmail = employeeEmail.replace(/ /g, ".");

        }
        date = date + " " + time;
        console.log("date:" + date)
        console.log("date1:" + date1)
        date1 = date1 + " " + time1
        console.log("date1:" + date1)
        fromDateMilli = new Date(date)
        console.log("fromDateMilli:" + fromDateMilli)
        fromDateMilli = fromDateMilli.getTime();
        fromDateMilli = fromDateMilli //- (3 * 60 * 60 * 1000);
        toDateMilli = new Date(date1)
        toDateMilli = toDateMilli.getTime();
        toDateMilli = toDateMilli //- (3 * 60 * 60 * 1000)
        showWhoIsOff(msg, email, fromDateMilli, toDateMilli, employeeEmail, type)


    })

}

function showWhoIsOff(msg, email, date, date1, employeeEmail, type) {
    managerToffyHelper.getNewSessionwithCookie(email, function (remember_me_cookie, session_Id) {
        var uri = 'http://' + IP + '/api/v1/employee/vacation-groupedByDay?fromDate=' + date + '&toDate=' + date1 + '&type=' + type
        var email = ""
        var workingDays = ""
        var Wordtype = ""
        var fromDate = ""
        var toDate = ""
        var workingHours = ""
        var headerMsg = ""
        console.log("uri " + uri)

        request({
            url: uri, //URL to hitDs
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': remember_me_cookie + ";" + session_Id

            }
            //Set the body as a stringcc
        }, function (error, response, body) {
            console.log(body)

            //  var obj = JSON.parse(body);
            var stringMessage = "["
            var i = 0
            var j = 0
            if (!JSON.parse(body)[0])
                msg.say("There are no off employees.")
            else {


                while (JSON.parse(body)[i]) {

                    j = 0
                    var jsonBody = JSON.parse(body)[i]
                    stringMessage = "["
                    while (jsonBody.vacationsGroupedByDay[j]) {


                        if (j > 0) {
                            stringMessage = stringMessage + ","
                        }
                        email = jsonBody.vacationsGroupedByDay[j].employee.email
                        workingDays = parseFloat(jsonBody.vacationsGroupedByDay[j].workingDays).toFixed(2)
                        Wordtype = env.vacationType.getVacationType(jsonBody.vacationsGroupedByDay[j].type)
                        if (workingDays < 1) {
                            Wordtype = ":walking: Leave"
                        }
                        workingHours = jsonBody.vacationsGroupedByDay[j].hours

                        if (workingDays < 1 || workingDays > 1) {
                            fromDate = (jsonBody.vacationsGroupedByDay[j].from)
                            toDate = (jsonBody.vacationsGroupedByDay[j].to)

                            env.dateHelper.converDateToWords(fromDate, toDate, 0, function (fromDateWord, toDateWord) {
                                console.log("fromDateWord" + fromDateWord)
                                console.log("toDateWord" + toDateWord)
                                if (workingDays > 1) {
                                    stringMessage = stringMessage + "{" + "\"title\":" + "\"" + email + " (" + Wordtype + " )" + "\"" + ",\"value\":" + "\"" + fromDateWord + "-" + toDateWord + " ( " + workingDays + " workingDays )" + "\"" + ",\"short\":false}"
                                    // leave 
                                } else {
                                    stringMessage = stringMessage + "{" + "\"title\":" + "\"" + email + " (" + Wordtype + " )" + "\"" + ",\"value\":" + "\"" + fromDateWord + "-" + toDateWord + " ( " + workingHours + " hours )" + "\"" + ",\"short\":false}"

                                }
                                j++;
                            })




                        } else {
                            stringMessage = stringMessage + "{" + "\"title\":" + "\"" + email + " (" + Wordtype + " )" + "\"" + ",\"value\":" + "\"" + workingDays + " working day " + "\"" + ",\"short\":false}"
                            j++;

                        }
                    }

                    stringMessage = stringMessage + "]"
                    console.log("stringMessage", stringMessage)
                    if (jsonBody.vacationsGroupedByDay == "") {
                        console.log("True")
                        headerMsg = "There are no off employees in this day"
                    } else headerMsg = ""
                    var messageBody = {
                        "text": "*" + jsonBody.day + "*",
                        "attachments": [
                            {
                                "attachment_type": "default",
                                "text": headerMsg,
                                "fallback": "ReferenceError",
                                "fields": stringMessage,
                                "color": "#F35A00"
                            }
                        ]
                    }
                    var stringfy = JSON.stringify(messageBody);

                    stringfy = stringfy.replace(/\\/g, "")
                    stringfy = stringfy.replace(/]\"/, "]")
                    stringfy = stringfy.replace(/\"\[/, "[")
                    stringfy = JSON.parse(stringfy)
                    msg.say(stringfy);
                    i++;
                }

            }

        })



    })

}
