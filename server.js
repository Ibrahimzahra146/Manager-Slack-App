'use strict'
const env = require('./public/configrations.js')

var APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_KEY
var requestIp = require('request-ip')
const express = require('express')
const Slapp = require('slapp')
const BeepBoopConvoStore = require('slapp-convo-beepboop')
const BeepBoopContext = require('slapp-context-beepboop')
const bodyParser = require('body-parser');
const uuid = require('node-uuid');
const request = require('request');
const requestify = require('requestify');
const JSONbig = require('json-bigint');
const managerToffyHelper = require('./managerToffyHelper.js')
const DateHelper = require('./DatesFunctions/datesFunctions.js')
var reminderHelper = require('./Reminders/remindersHelper.js')
const messageGenerator = require('./messagesHelper/messageGenerator.js')
const async = require('async');
const apiai = require('apiai');
const APIAI_LANG = 'en';
const apiAiService = apiai(APIAI_ACCESS_TOKEN);
var pg = require('pg');
var sessionId = uuid.v1();
var db = require('node-localdb');
var userdb = db('./userDetails1.json')
var APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_KEY;
var SLACK_ACCESS_TOKEN = process.env.SLACK_APP_ACCESS_KEY;
exports.SLACK_ACCESS_TOKEN = SLACK_ACCESS_TOKEN
var SLACK_BOT_TOKEN = process.env.SLACK_BOT_ACCESS_KEY;
var fs = require('fs');
var userId = ""
var employeeChannel = "";
var IP = process.env.SLACK_IP
var managerChannel = "D3RR2RE68"
var Constants = require('./Constants.js');
var employee = require("./employeeSide.js")
var whoIsOff = require("./public/whoIsOff.js")
var vacationHelper = require("./public/Vacation.js")
var managerIdInHr = ""
var vacation_type1 = ""
var fromDate = ""
var toDate = "";
var generalEmail = "";
var generalEmailForEmpInfo = ""
var isInfo = ""
var generalEmpInfo = ""
var generalAny = ""
var messageSender = require('./messagesHelper/messageSender.js')
var replaceMessage = require('./messagesHelper/replaceManagerActionMessage.js')

pg.defaults.ssl = true;
if (!process.env.PORT) throw Error('PORT missing but required')
var slapp = Slapp({
  convo_store: BeepBoopConvoStore(),
  context: BeepBoopContext()
})
var Botkit = require('./lib/Botkit.js');
var controller = Botkit.slackbot({
  debug: true,
});
var controller2 = Botkit.slackbot({
  debug: true,
});
console.log("the token is " + APIAI_ACCESS_TOKEN)
var bot = controller.spawn({
  token: SLACK_BOT_TOKEN

}).startRTM();
exports.bot = bot



function sendVacationPutRequest(vacationId, approvalId, managerEmail, status, callback) {
  var isDeleted = false;

  env.managerToffyHelper.getNewSessionwithCookie(managerEmail, function (remember_me_cookie, session_id) {
    env.managerToffyHelper.general_remember_me = remember_me_cookie;
    env.managerToffyHelper.general_session_Id = session_id
    var uri = 'http://' + env.IP + '/api/v1/vacation/' + vacationId + '/managerApproval/' + approvalId
    console.log("uri: :" + uri)
    var approvalBody = {
      "id": approvalId,
      "comments": "",
      "state": status,
      "type": " "

    }
    approvalBody = JSON.stringify(approvalBody)
    request({
      url: uri, //URL to hitDs
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': remember_me_cookie + ";" + session_id
      },
      body: approvalBody
      //Set the body as a stringcc
    }, function (error, response, body) {
      if (response.statusCode == 404) {
        isDeleted = true
      }
      console.log("arrive at get new POST requst " + response.statusCode)
      callback(isDeleted)
    });
  })


}

/*--------------___________________________________________________----------------------
Add manager infromation to database
-------------____________________________________________________---------------------
*/
function storeManagerSlackInformation(email, msg) {
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

    if (response.statusCode == 404) {


      console.log("The employee not found  ")
      requestify.post('http://' + env.IP + '/api/v1/toffy', {
        "email": email,
        "hrChannelId": "",
        "managerChannelId": msg.body.event.channel,
        "slackUserId": msg.body.event.user,
        "teamId": msg.body.team_id,
        "userChannelId": ""
      })
        .then(function (response) {
          // Get the response body
          response.getBody();
        });

    }

    /*--------------___________________________________________________----------------------
    check if the record is already exist ,that mean the manager use the system as employee
    -------------____________________________________________________---------------------
    */
    else if (response.statusCode == 200) {

      if (((JSON.parse(body)).managerChannelId) != (msg.body.event.channel)) {
        var userChId = JSON.parse(body).userChannelId;
        var hrChId = JSON.parse(body).hrChannelId;
        request({
          url: "http://" + env.IP + "/api/v1/toffy/" + JSON.parse(body).id, //URL to hitDs
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': 'JSESSIONID=24D8D542209A0B2FF91AB2A333C8FA70'
          },
          body: email
          //Set the body as a stringcc
        }, function (error, response, body) {
          console.log("Deleted" + response.statusCode)
          console.log("DELETEd");

        });
        console.log("=====>arrive3")
        requestify.post('http://' + env.IP + '/api/v1/toffy', {
          "email": email,
          "hrChannelId": hrChId,
          "managerChannelId": msg.body.event.channel,
          "slackUserId": msg.body.event.user,
          "teamId": msg.body.team_id,
          "userChannelId": userChId
        })
          .then(function (response) {
            console.log("=====>arrive4")

            // Get the response body
            response.getBody();
          });
      }
    }
  });
}
//send the text to api ai 
function sendRequestToApiAi(emailValue, msg) {
  env.managerToffyHelper.getRoleByEmail(emailValue, "ADMIN", function (role) {
    if (role == true) {
      storeManagerSlackInformation(emailValue, msg);
      var text = msg.body.event.text;
      env.TextService.prepareTextForApiAi(text, function (preparedText) {
        console.log("prepareTextForApiAi" + preparedText)


        let apiaiRequest = env.apiAiService.textRequest(preparedText,
          {
            sessionId: env.sessionId
          });
        apiaiRequest.on('response', (response) => {
          let responseText = response.result.fulfillment.speech;

          if (responseText == "whoIsOff") {
            console.log("arrive")
            whoIsOff.whoIsOff(msg, response, emailValue)
          }
          else if (responseText == "showEmployeeInfo") {
            console.log("Info type:" + response.result.parameters.employee_info_types)

            var employeeEmail = "";
            if (response.result.parameters.any && response.result.parameters.any != "") {
              env.mRequests.getUserSlackInfoBySlackId(response.result.parameters.any, function (error, response1, body) {
                //Mention user
                if (error != 1000) {
                  employeeEmail = body.user.profile.email
                } else {
                  employeeEmail = response.result.parameters.any + "@exalt.ps"
                  employeeEmail = employeeEmail.replace(/ /g, ".");
                  if ((employeeEmail).indexOf('mailto') > -1) {

                    employeeEmail = employeeEmail.toString().split(':')
                    employeeEmail = employeeEmail[1];
                    // employeeEmail = employeeEmail.replace(/>/g, "");
                    console.log("Email after split mail to " + employeeEmail)
                  }
                }
                generalEmailForEmpInfo = employeeEmail


                if (response.result.parameters.employee_info_types == "stats" || generalEmpInfo != "") {
                  employee.showEmployeeStats(emailValue, generalEmailForEmpInfo, msg);
                  generalEmailForEmpInfo = ""
                  generalEmpInfo = ""
                  generalEmail = ""

                }
                else if (response.result.parameters.employee_info_types == "profile" || generalEmpInfo != "") {
                  employee.showEmployeeProfile(emailValue, generalEmailForEmpInfo, msg)
                  generalEmailForEmpInfo = ""
                  generalEmpInfo = ""
                  generalEmail = ""

                }
                else if (response.result.parameters.employee_info_types == "history" || generalEmpInfo != "") {
                  employee.showEmployeeHistory(emailValue, generalEmailForEmpInfo, msg)
                  generalEmailForEmpInfo = ""
                  generalEmpInfo = ""
                  generalEmail = ""

                }
                else if (response.result.parameters.employee_info_types == "pending" || generalEmpInfo != "") {
                  employee.showEmployeePendingRequest(emailValue, generalEmailForEmpInfo, msg)
                  generalEmailForEmpInfo = ""
                  generalEmpInfo = ""
                  generalEmail = ""

                }
                // else employee.showEmployeeProfile(emailValue, employeeEmail, msg)
                else {
                  msg.say("Please specify on of the following :profile,stats or history ")
                }


              })

            }
            else if (response.result.parameters.email && response.result.parameters.email != "") {
              console.log("response.result.parameters.email" + response.result.parameters.email)
              console.log("Case2")

              if ((response.result.parameters.email).indexOf('mailto') > -1) {
                employeeEmail = response.result.parameters.email
                employeeEmail = employeeEmail.toString().split('|')
                employeeEmail = employeeEmail[1];
                employeeEmail = employeeEmail.replace(/>/g, "");
                console.log("Email after split mail to " + employeeEmail)
                generalEmailForEmpInfo = employeeEmail

              }
              else {
                employeeEmail = response.result.parameters.email
                generalEmailForEmpInfo = employeeEmail


              }
              if (generalEmail != "") {
                generalEmailForEmpInfo = generalEmail
              }




              if (response.result.parameters.employee_info_types == "stats" || generalEmpInfo != "") {

                employee.showEmployeeStats(emailValue, generalEmailForEmpInfo, msg);
                generalEmailForEmpInfo = ""
                generalEmpInfo = ""
                generalEmail = ""


              }
              else if (response.result.parameters.employee_info_types == "profile" || generalEmpInfo != "") {
                employee.showEmployeeProfile(emailValue, generalEmailForEmpInfo, msg)
                generalEmailForEmpInfo = ""
                generalEmpInfo = ""
                generalEmail = ""


              }
              else if (response.result.parameters.employee_info_types == "history" || generalEmpInfo != "") {
                employee.showEmployeeHistory(emailValue, generalEmailForEmpInfo, msg)
                generalEmailForEmpInfo = ""
                generalEmpInfo = ""
                generalEmail = ""

              }
              else if (response.result.parameters.employee_info_types == "pending" || generalEmpInfo != "") {
                employee.showEmployeePendingRequest(emailValue, generalEmailForEmpInfo, msg)
                generalEmailForEmpInfo = ""
                generalEmpInfo = ""
                generalEmail = ""

              }
              // else employee.showEmployeeProfile(emailValue, employeeEmail, msg)
              else {
                msg.say("Please specify on of the following :profile, stats, history or pending ")
              }

            } else if (!(response.result.parameters.any || response.result.parameters.email) && response.result.parameters.employee_info_types) {
              //Show pending request for manager  
              if (response.result.parameters.employee_info_types == "pending") {
                env.PendingService.showManagerPendingRequest(msg, emailValue)


              } else {

                msg.say("Please specify employee email")
                generalEmpInfo = response.result.parameters.employee_info_types
                console.log("Arriveee" + generalEmpInfo)
              }

            }
          }





          else if (responseText == "vacationWithLeave") {
            env.VacationService.vacationWithLeave(msg, response, emailValue)

          }
          else if ((responseText) == "Help") {

            managerToffyHelper.sendHelpOptions(msg);
          }
          else if (responseText == "Reminders") {
            env.dateHelper.getTodayDate(function (today) {
              var date = today
              var time = ""
              var reminderFor = ""
              var isReminder = ""
              if (response.result.parameters.reminder && response.result.parameters.time && response.result.parameters.date && response.result.parameters.any) {
                date = response.result.parameters.date
                time = response.result.parameters.time
                reminderFor = response.result.parameters.any


              } else if (response.result.parameters.reminder && response.result.parameters.time && response.result.parameters.date) {
                date = response.result.parameters.date
                time = response.result.parameters.time

              }
              else if (response.result.parameters.reminder && response.result.parameters.time && response.result.parameters.any) {
                time = response.result.parameters.time
                reminderFor = response.result.parameters.any

              }
              else if (response.result.parameters.reminder && response.result.parameters.time) {
                time = response.result.parameters.time

              }
              reminderHelper.setReminder(msg, emailValue, time, reminderFor, msg.meta.app_token)
            })


          }
          else {
            msg.say(responseText);
            generalEmail = ""

          }

        });
        apiaiRequest.on('error', (error) => console.error(error));
        apiaiRequest.end();
      })
    } else if (role == 1000) {
      msg.say("Your account has been deactivated. You are not allowed to use the system.")
    }


    else {
      msg.say("Sorry!.You dont have the permession to use this bot.")
    }

  })

}
/** */



/*--------------___________________________________________________----------------------
get all information about team users like email ,name ,user id ...etc
-------------____________________________________________________---------------------
*/
function getMembersList(Id, msg) {
  var emailValue = "";
  request({
    url: Constants.SLACK_MEMBERS_LIST_URL + "" + SLACK_ACCESS_TOKEN,
    json: true
  }, function (error, response, body) {

    if (!error && response.statusCode === 200) {
      var i = 0;
      while ((body.members[i] != null) && (body.members[i] != undefined)) {

        if (body.members[i]["id"] == Id) {
          console.log(body.members[i]["profile"].email);
          emailValue = body.members[i]["profile"].email;

          sendRequestToApiAi(emailValue, msg);
          break;
        }


        i++;
      }
    }
  });
}

/*--------------___________________________________________________----------------------
listen for user messages
-------------____________________________________________________---------------------
*/
var app = slapp.attachToExpress(express())
slapp.message('(.*)', ['direct_message'], (msg, text, match1) => {
  if (msg.body.event.user == "U5SUVPG2D") {

    console.log("message from bot")
    var stringfy = JSON.stringify(msg);


  } else {


    var stringfy = JSON.stringify(msg);
    console.log("the message is ");
    console.log(stringfy);
    getMembersList(msg.body.event.user, msg)
  }
})


slapp.action('manager_confirm_reject', 'confirm', (msg, value) => {
  managerApproval1(msg, value, "Approved", 0, "", 0, 0)
})



slapp.action('manager_confirm_reject', 'reject', (msg, value) => {
  managerApproval1(msg, value, "Rejected", 0, "", 0, 0)
})



slapp.action('manager_confirm_reject', 'dont_detuct', (msg, value) => {

  managerApproval1(msg, value, "ApprovedWithoutDeduction", 0, "")

})
// check vacation state
slapp.action('manager_confirm_reject', 'check_state', (msg, value) => {
  var arr = value.toString().split(";")
  var userEmail = arr[0];
  var vacationId = arr[1];
  var approvalId = arr[2]
  var managerEmail = arr[3]
  var fromWho = arr[4];
  var fromDate = arr[5];
  var toDate = arr[6];
  var type = arr[7]
  var workingDays = arr[8]
  var ImageUrl = arr[9]
  vacationHelper.getVacationState(managerEmail, vacationId, function (state, body) {
    if (state == 404) {
      replaceMessage.replaceCanceledRequestOnAction(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)
    } else if (state == 200) {
      if (JSON.parse(body).sickCovertedToPersonal == true) {
        replaceMessage.replaceAlreadyRejectedVacation(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)
      } else {


        // replaceMessage.replaceMessageOnCheckState(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)
        messageGenerator.generateManagerApprovelsSection(JSON.parse(body).managerApproval, managerEmail, JSON.parse(body).needsSickReport, function (managerApprovalsSection) {
          vacationHelper.getSecondApproverStateAndFinalState(managerEmail, body, 1, 0, function (myEmail, myAction, vacationState) {
            replaceMessage.replaceMessageOnCheckState(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays, managerApprovalsSection, vacationState, myAction, JSON.parse(body).comments)

          })
        })
      }
    }
  })
})
/**
 * 
 */
// check vacation state
slapp.action('manager_confirm_reject', 'check_state_undo', (msg, value) => {
  var arr = value.toString().split(";")
  var userEmail = arr[0];
  var vacationId = arr[1];
  var approvalId = arr[2]
  var managerEmail = arr[3]
  var fromWho = arr[4];
  var fromDate = arr[5];
  var toDate = arr[6];
  var type = arr[7]
  var workingDays = arr[8]
  var ImageUrl = arr[9]
  var sick_attachments = 0
  vacationHelper.getVacationState(managerEmail, vacationId, function (state, body) {
    if (JSON.parse(body).attachments != "") {
      sick_attachments = 1
    }

    if (state == 404) {
      replaceMessage.replaceCanceledRequestOnAction(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)
    } else if (state == 200) {
      if (JSON.parse(body).sickCovertedToPersonal == true) {
        replaceMessage.replaceAlreadyRejectedVacation(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)
      } else {
        // replaceMessage.replaceMessageOnCheckState(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)
        messageGenerator.generateManagerApprovelsSection(JSON.parse(body).managerApproval, managerEmail, JSON.parse(body).needsSickReport, function (managerApprovalsSection) {
          vacationHelper.getSecondApproverStateAndFinalState(managerEmail, body, 1, 0, function (myEmail, myAction, vacationState) {
            replaceMessage.replaceMessage(msg, userEmail, managerEmail, fromDate, toDate, type, myAction, vacationId, approvalId, ImageUrl, "", workingDays, managerApprovalsSection, vacationState, JSON.parse(body).comments, sick_attachments)

          })
        })
      }
    }
  })
})
function managerAction(msg, value, typeOfaction) {
  var arr = ""
  var type = ""
  var managerEmail = ""
  var fromDateInMilliseconds = ""
  var toDateInMilliseconds = ""
  var workingDays = ""
  var employeeEmail = ""
  var fromTime = ""
  var toTime = ""
  var wordFromDate = ""
  var messageText = ""
  var wordToDate = ""

  var employeeEmail = ""
  var managerId = ""
  env.dateHelper.getTodayDate(function (todayDate) {
    arr = value.toString().split(";");
    fromTime = arr[0]
    toTime = arr[1]
    managerEmail = arr[2];
    fromDateInMilliseconds = arr[3];
    toDateInMilliseconds = arr[4]
    type = arr[5]
    workingDays = arr[6]
    wordFromDate = arr[7]
    wordToDate = arr[8]
    messageText = arr[9]
    employeeEmail = arr[10]
    managerToffyHelper.sendVacationPostRequest(/*from  */fromDateInMilliseconds, toDateInMilliseconds, managerToffyHelper.userIdInHr, employeeEmail, managerEmail, type, function (vacationId, managerApproval) {

      DateHelper.convertTimeFormat(arr[0], function (formattedTime, midday) {

        DateHelper.convertTimeFormat(arr[1], function (formattedTime1, midday1) {




          if (!managerApproval[0]) {
            msg.say(" dont have any manager right now ");
          } else {
            console.log("fromDate:::-->" + fromDate)
            console.log("toDate:::-->" + toDate)
            messageSender.sendFeedBackToEmpOnManagerBehalfFeedback(employeeEmail, wordFromDate, wordToDate, managerEmail, type, vacationId, managerApproval, workingDays)
            messageSender.SendNotificationToSecondManagerOnManagerBehalfVacation(employeeEmail, wordFromDate, wordToDate, managerEmail, type, vacationId, managerApproval, workingDays)

            if (type == "sick") {
              console.log("Managers approvals sick vacation is ::" + JSON.stringify(managerApproval))
              msg.respond(msg.body.response_url, "Your request has been submitted . ")

            }
            else
              msg.respond(msg.body.response_url, "Your time off request for " + employeeEmail + " from ( " + wordFromDate + "- " + wordToDate + " ) has been submitted.")

          }
        });

      });

      //get The id of the manager inorder to get approval id and vacation ID
      var i = 0
      while (managerApproval[i]) {
        if (managerApproval[i].manager == managerId) {
          var value = employeeEmail + ";" + vacationId + ";" + managerApproval[i].id + ";" + managerEmail
          console.log("value: :" + value)
          managerApproval1(msg, value, "Approved", 1, "")
          break;
        }
        i++;
      }

    });
  })

  fromDate = "";
  toDate = "";

}
function managerApproval1(msg, value, approvalType, fromManager, comment, rejectConfFlag, sickReportFlag) {
  var pastflag = 0
  var upload_sick_report_message = "";
  var feedback_message_to_emp = ""
  var arr = value.toString().split(";")
  var userEmail = arr[0];
  var vacationId = arr[1];
  var approvalId = arr[2]
  var managerEmail = arr[3]
  var fromWho = arr[4];
  var fromDate = arr[5];
  var toDate = arr[6];
  var type = arr[7]
  var workingDays = arr[8]
  var ImageUrl = arr[9]
  var sick_attachments = 0
  console.log("ImageUrl" + ImageUrl)
  var typeText = " time off"
  if (type == "sick") {
    typeText = " sick time off "
  } else if (type == "Maternity") {
    typeText = " maternity" + " time off"
  } else if (type == "Paternity") {
    typeText = " paternity" + " time off"
  } else if (type == "WFH")
    typeText = " work from home"
  vacationHelper.getVacationState(managerEmail, vacationId, function (state, vacationBody) {

    if (state == 404) {
      replaceMessage.replaceCanceledRequestOnAction(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)

    } else {


      var currentMilliseconds = new Date().getTime();
      if (currentMilliseconds > JSON.parse(vacationBody).fromDate)
        pastflag = 1
      //check if the vaction rejected in order to prevent manager to take an action
      if (JSON.parse(vacationBody).sickCovertedToPersonal == true) {
        replaceMessage.replaceAlreadyRejectedVacation(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)
      }
      else {


        messageGenerator.generateManagerApprovelsSection(JSON.parse(vacationBody).managerApproval, managerEmail, JSON.parse(vacationBody).needsSickReport, function (managerApprovalsSection) {


          if (approvalType == "Rejected" && pastflag == 1 && rejectConfFlag == 0 && type == "sick") {
            replaceMessage.replaceRejectedConfirmation(msg, userEmail, managerEmail, fromDate, toDate, type, "Pending", vacationId, approvalId, ImageUrl, typeText, workingDays, managerApprovalsSection, JSON.parse(vacationBody).vacationState, JSON.parse(vacationBody).comments)
          } else {


            sendVacationPutRequest(vacationId, approvalId, managerEmail, approvalType, function (isDeleted) {
              if (isDeleted == false) {
                if (fromManager != 1) {
                  vacationHelper.getVacationState(managerEmail, vacationId, function (state, vacationBody1) {
                    if (JSON.parse(vacationBody1).attachments != "")
                      sick_attachments = 1


                    //if (JSON.parse(vacationBody1).vacationState == "Approved")
                    var existReportFlag = JSON.parse(vacationBody1).needsSickReport
                    messageGenerator.generateManagerApprovelsSection(JSON.parse(vacationBody1).managerApproval, managerEmail, existReportFlag, function (managerApprovalsSection1) {


                      env.mRequests.getSlackRecord(userEmail, function (error, response, body) {
                        var responseBody = JSON.parse(body);
                        var slack_message = env.stringFile.slack_message(responseBody.userChannelId, responseBody.slackUserId, responseBody.teamId)
                        if (approvalType == "ApprovedWithReport") {
                          feedback_message_to_emp = env.stringFile.upload_sick_report_message(managerEmail, vacationId, fromDate, toDate, type)


                          env.bot.startConversation(slack_message, function (err, convo) {

                            if (!err) {
                              var stringfy = JSON.stringify(feedback_message_to_emp);
                              var obj1 = JSON.parse(stringfy);
                              env.bot.reply(slack_message, obj1);

                            }
                          });

                        } else {
                          if ((JSON.parse(vacationBody1).vacationState == "Approved") || (JSON.parse(vacationBody1).vacationState == "Rejected") || JSON.parse(vacationBody1).vacationState == "ApprovedWithoutDeduction")
                            messageSender.sendMessagetoEmpOnAction(msg, managerEmail, fromDate, toDate, userEmail, type, bot, approvalType, vacationBody1, typeText, responseBody, comment);

                        }
                        if (approvalType == "Rejected" && rejectConfFlag == 1) {
                          replaceMessage.replaceAlreadyRejectedVacation(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)

                        } else


                          replaceMessage.replaceMessage(msg, userEmail, managerEmail, fromDate, toDate, type, approvalType, vacationId, approvalId, ImageUrl, typeText, workingDays, managerApprovalsSection1, JSON.parse(vacationBody1).vacationState, JSON.parse(vacationBody1).comments, sick_attachments)
                        /* if (comment != "accept_with_report")
                           messageSender.sendMessagetoEmpOnAction(msg, managerEmail, fromDate, toDate, userEmail, type, bot, approvalType, body, typeText, responseBody, comment);
         */




                      })
                    })
                  })

                }
              }
              else replaceMessage.replaceCanceledRequestOnAction(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)



            })
          }
        })
      }
    }
  })
}





slapp.action('leave_with_vacation_confirm_reject', 'confirm', (msg, value) => {
  managerAction(msg, value, "Approved")
})

slapp.action('leave_with_vacation_confirm_reject', 'confirm_without_detuction', (msg, value) => {
  managerAction(msg, value, "ApprovedWithoutDeduction")
})
slapp.action('leave_with_vacation_confirm_reject', 'reject', (msg, value) => {
  msg.respond(msg.body.response_url, "Ok, operation aborted.")
  fromDate = "";
  toDate = "";
})
//Undo action
slapp.action('manager_confirm_reject', 'Undo', (msg, value) => {
  var arr = value.toString().split(";")
  var userEmail = arr[0];
  var vacationId = arr[1];
  var approvalId = arr[2]
  var managerEmail = arr[3]
  var fromWho = arr[4];
  var fromDate = arr[5];
  var toDate = arr[6];
  var type = arr[7]
  var workingDays = arr[8]
  var ImageUrl = arr[9]

  vacationHelper.getVacationState(managerEmail, vacationId, function (state, body) {
    if (state == 404) {
      replaceMessage.replaceCanceledRequestOnAction(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)

    } else {


      messageGenerator.generateManagerApprovelsSection(JSON.parse(body).managerApproval, managerEmail, JSON.parse(body).needsSickReport, function (managerApprovalsSection) {

        vacationHelper.getSecondApproverStateAndFinalState(managerEmail, body, 1, 0, function (myEmail, myAction, vacationState) {
          replaceMessage.undoAction(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays, managerApprovalsSection, vacationState, myAction, JSON.parse(body).comments)
        })
      })
    }
  })
})
slapp.action('manager_confirm_reject', 'reject_with_comment', (msg, value) => {
  var arr = value.toString().split(";")
  var userEmail = arr[0];
  var vacationId = arr[1];
  var approvalId = arr[2]
  var managerEmail = arr[3]
  var fromWho = arr[4];
  var fromDate = arr[5];
  var toDate = arr[6];
  var type = arr[7]
  var workingDays = arr[8]
  var ImageUrl = arr[9]
  vacationHelper.getVacationState(managerEmail, vacationId, function (state, body) {
    vacationHelper.getSecondApproverStateAndFinalState(managerEmail, body, 1, 0, function (myEmail, myAction, vacationState) {

      messageGenerator.generateManagerApprovelsSection(JSON.parse(body).managerApproval, managerEmail, JSON.parse(body).needsSickReport, function (managerApprovalsSection) {

        replaceMessage.replaceWithComment(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays, managerApprovalsSection, vacationState, myAction, JSON.parse(body).comments)
      })
    })
  })
})
slapp.action('manager_confirm_reject', 'Send_comment', (msg, value) => {
  var arr = value.toString().split(";")
  var comment = arr[10]

  managerApproval1(msg, value, "Rejected", 0, comment)
})



/**********************
 * Accept with report listener ,
 * send upload sick report to employee
 * 
 * 
 */

slapp.action('manager_confirm_reject', 'accept_with_report', (msg, value) => {

  managerApproval1(msg, value, "ApprovedWithReport", 0, "", 0, 1)


})

slapp.action('manager_confirm_reject', 'Rejected_Conf', (msg, value) => {

  managerApproval1(msg, value, "Rejected", 0, "", 1, 0)


})
/************
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 
controller2.hears(['(.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
  console.log("Sufferring")
  console.log(JSON.stringify(message))
})
controller.on('message_received', function (bot, message) {
 
  console.log("Sufferring11")
  console.log(JSON.stringify(message))
 
})
controller.on('direct_message', function (bot, message) {
 
  console.log("Sufferring11222")
  console.log(JSON.stringify(message))
 
})
*/
/**
 * 
 * Post api to send reminder to managers every day when they have pending request
 */
app.get('/manager/pending-request-reminder', (req, res) => {
  /*var parsedBody = JSON.parse(req.body)
  var vacationId = parsedBody.id

  var fromDate = parsedBody.fromDate

  var toDate = parsedBody.toDate

  var email = parsedBody.employee.email

  env.mRequests.getSlackRecord(email, function (body) {


    var responseBody = JSON.parse(body);
    var slackMsg = env.stringFile.Slack_Channel_Function(responseBody.userChannelId, responseBody.slackUserIdresponseBody.teamId);
    var messageFB = env.stringFile.oneDayLeftInfoMessage(fromDateWord, toDateWord)
    var text12 = env.stringFile.oneDayLeftSickJsonMessage(messageFB, email, vacationId, fromDateWord, toDateWord)
    env.bot.startConversation(slackMsg, function (err, convo) {


      if (!err) {

        var stringfy = JSON.stringify(text12);
        var obj1 = JSON.parse(stringfy);
        env.employeeBot.reply(slackMsg, obj1);

      }

    });
  })*/

  res.send("Hi")
});

app.get('/', function (req, res) {
  var clientIp = requestIp.getClientIp(req);
  console.log("new request ");
  console.log(clientIp)
  res.send('Hello1')
})


console.log('Listening on :' + process.env.PORT)
app.listen(process.env.PORT)
