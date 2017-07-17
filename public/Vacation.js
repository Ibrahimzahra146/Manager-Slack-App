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
            console.log("getVacationState" + JSON.stringify(body))
            callback(response.statusCode, body)

        })
    });
}
module.exports.getSecondApproverStateAndFinalState = function getSecondApproverStateAndFinalState(email, body, state, pendingManagerApprovalFlag, callback1) {
    console.log("getSecondApproverStateAndFinalState" + approvalId)

    var approver2Email = "--"
    var approver2Action = "--"
    var myAction = "--"

    var vacationState = "--"
    var approvalId = ""
    var parsedBody = ""
    if (pendingManagerApprovalFlag == 1) {
        parsedBody = body

    } else parsedBody = JSON.parse(body)
    //no second Approver 
    if (state == 0 && !(parsedBody.managerApproval[1])) {
        callback1("--", "--", parsedBody.vacationState)
    } else {
        var i = 0;
        async.whilst(
            function () { return parsedBody.managerApproval[i]; },
            function (callback) {
                if (parsedBody.managerApproval[i].managerEmail == email && state == 1 && parsedBody.managerApproval[i].type == "Manager") {

                    approver2Email = parsedBody.managerApproval[i].managerEmail
                    approver2Action = parsedBody.managerApproval[i].state
                    vacationState = parsedBody.vacationState
                    approvalId = parsedBody.managerApproval[i].id
                    console.log("getSecondApproverStateAndFinalState" + approvalId)

                    callback1(approver2Email, approver2Action, vacationState, approvalId)
                }
                else if (parsedBody.managerApproval[i].managerEmail != email && state == 0) {

                    approver2Email = parsedBody.managerApproval[i].managerEmail
                    approver2Action = parsedBody.managerApproval[i].state
                    vacationState = parsedBody.vacationState
                    approvalId = parsedBody.managerApproval[i].id
                    console.log("getSecondApproverStateAndFinalState" + approvalId)

                    callback1(approver2Email, approver2Action, vacationState, approvalId)
                }
                i++
                setTimeout(callback, 500);

            },
            function (err) {
                // 5 seconds have passed
            }

        );
    }





}