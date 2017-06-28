const request = require('request');
var managerToffyHelper = require('.././managerToffyHelper.js')
var server = require('.././server.js')
var sessionFlag = 0;
var generalCookies = "initial"
var IP = process.env.SLACK_IP
var employee = require(".././employeeSide.js")
module.exports.whoIsOff = function whoIsOff(msg, response, email) {
    managerToffyHelper.getTodayDate(function (today) {
        var time1 = "17:00:00";
        var time = "08:00:00";
        var date = today
        var date1 = today
        var fromDateMilli = ""
        var toDateMilli = ""
        var employeeEmail = ""
        var type = 0
        if (response.result.parameters.in_off == "wfh")
            type = 7

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
        fromDateMilli = fromDateMilli - (3 * 60 * 60 * 1000);
        toDateMilli = new Date(date1)
        toDateMilli = toDateMilli.getTime();
        toDateMilli = toDateMilli - (3 * 60 * 60 * 1000)
        showWhoIsOff(msg, email, fromDateMilli, toDateMilli, employeeEmail, type)


    })

}

function showWhoIsOff(msg, email, date, date1, employeeEmail, type) {
    managerToffyHelper.getNewSessionwithCookie(email, function (remember_me_cookie, session_Id) {
        var uri = 'http://' + IP + '/api/v1/employee/off?from=' + date + '&to=' + date1 + '&type=' + type
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
            console.log("JSON:" + JSON.stringify(body))
            var isOffFlag = 0
            var obj = JSON.parse(body);
            var stringMessage = "["
            var i = 0
            if (!obj[0])
                if (employeeEmail != "") {
                    msg.say(employeeEmail + " is not off.")

                } else
                    msg.say("There are no off employees.")
            else {
                while (obj[i]) {
                    if (employeeEmail != "") {
                        console.log("employeeEmail11")
                        console.log("JSON.parse(body))[i].email" + JSON.parse(body)[i].email + "s")
                        console.log("employeeEmail::" + employeeEmail + "s")
                        if ((JSON.parse(body))[i].email == employeeEmail) {
                            console.log("employeeEmail12")
                            isOffFlag = 1
                        }
                    }
                    else {
                        if (i > 0) {
                            stringMessage = stringMessage + ","
                        }
                        stringMessage = stringMessage + "{" + "\"title\":" + "\"" + (JSON.parse(body))[i].name + "\"" + ",\"value\":" + "\"" + (JSON.parse(body))[i].email + "\"" + ",\"short\":false}"
                    }
                    i++;
                }
                if (employeeEmail != "") {
                    if (isOffFlag == 1) {
                        msg.say(employeeEmail + " is off.")

                    } else msg.say(employeeEmail + " is not off.")
                } else {
                    stringMessage = stringMessage + "]"
                    console.log("stringMessage", stringMessage)
                    var messageBody = {
                        "text": "These employees are off :",
                        "attachments": [
                            {
                                "attachment_type": "default",
                                "text": " ",
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
                }
            }
        })


    })


}
