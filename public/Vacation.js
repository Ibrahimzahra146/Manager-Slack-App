const request = require('request');
var managerToffyHelper = require('.././managerToffyHelper.js')
var server = require('.././server.js')
var sessionFlag = 0;
var generalCookies = "initial"
var IP = process.env.SLACK_IP
var employee = require(".././employeeSide.js")
var async = require('async');
var messageReplacer = require('.././messagesHelper/replaceManagerActionMessage.js')

/**
 * This function check the state of a given vacation in order the manager 
 * 
 */
module.exports.getVacationState = function getVacationState(email, vacationId, callback) {
    console.log("getVacationState")
    managerToffyHelper.getNewSessionwithCookie(email, function (remember_me_cookie, sessionId) {
        managerToffyHelper.general_remember_me = remember_me_cookie
        managerToffyHelper.general_session_id = sessionId

        var uri = "http://" + IP + "/api/v1/vacation/" + vacationId
        console.log(uri)
        request({
            url: uri, //URL to hitDs
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': managerToffyHelper.general_remember_me + ";" + sessionId
            }
            //Set the body as a stringcc
        }, function (error, response, body) {
            console.log("Response.statusCode:" + response.statusCode)
            callback(response.statusCode)

        })
    });
}
module.exports.getSecondApproverStateAndFinalState = function getSecondApproverStateAndFinalState(email, vacationId, callback1) {

    var approver2Email = "--"
    var approver2Action = "--"

    var vacationState = "--"
    managerToffyHelper.getNewSessionwithCookie(email, function (remember_me_cookie, sessionId) {
        managerToffyHelper.general_remember_me = remember_me_cookie
        managerToffyHelper.general_session_id = sessionId

        var uri = "http://" + IP + "/api/v1/vacation/" + vacationId
        console.log(uri)
        request({
            url: uri, //URL to hitDs
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': managerToffyHelper.general_remember_me + ";" + sessionId
            }
            //Set the body as a stringcc
        }, function (error, response, body) {
            var i = 0;
            async.whilst(
                function () { return JSON.parse(body).managerApproval[i]; },
                function (callback) {
                    if (JSON.parse(body).managerApproval[i].managerEmail != email) {
                        
                        approver2Email = JSON.parse(body).managerApproval[i].managerEmail
                        approver2Action = JSON.parse(body).managerApproval[i].state
                        vacationState = JSON.parse(body).vacationState
                    }
                    i++
                    setTimeout(callback, 5000);

                },
                function (err) {
                    // 5 seconds have passed
                }

            );
            callback(approver2Email, approver2Action, vacationState)


        })
    });
}