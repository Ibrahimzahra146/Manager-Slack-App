var requestify = require('requestify');
const request = require('request');
var server = require('.././server')
var async = require('async');
var IP = process.env.SLACK_IP
var managerToffyHelper = require('.././managerToffyHelper')

//export setReminder for manger
module.exports.setReminder = function setReminder(msg, email, time, reminderFor, SlackAccessToken) {
    console.log("set reminder")
    getUserId(email, function (userSlackId) {
        console.log("userSlackId" + userSlackId)
        var uri = 'https://slack.com/api/reminders.add?token=' + SlackAccessToken + '&text=' + reminderFor + '&time=' + time + 'user=' + userSlackId + '&pretty=1'
        request({
            url: uri,
            method: 'GET',

        }, function (error, response, body) {
            console.log("Reminder set")
            console.log(JSON.stringify(body))
            console.log(JSON.stringify(response))
        })
    })

}
function getUserId(email, callback) {
    request({
        url: 'http://' + IP + '/api/v1/toffy/get-record', //URL to hitDs
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': 'JSESSIONID=24D8D542209A0B2FF91AB2A333C8FA70'
        },
        body: email
        //Set the body as a stringcc
    }, function (error, response, body) {
        var responseBody = JSON.parse(body);
        var userSlackId = responseBody.slackUserId
        callback(userSlackId)
    })

}



