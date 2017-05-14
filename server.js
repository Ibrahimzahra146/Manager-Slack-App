'use strict'
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
//*********
var manager_bot = controller2.spawn({
  token: process.env.MANAGER_BOT_ACCESS_KEY

}).startRTM();
exports.manager_bot = manager_bot
/***************** */

var hr_bot = controller.spawn({
  token: process.env.HR_BOT_ACCESS_KEY

}).startRTM();
exports.hr_bot = hr_bot
//******************


function sendVacationPutRequest(vacationId, approvalId, managerEmail, status, callback) {
  var isDeleted = false;

  managerToffyHelper.getNewSessionwithCookie(managerEmail, function (remember_me_cookie, session_id) {
    managerToffyHelper.general_remember_me = remember_me_cookie;
    managerToffyHelper.general_session_Id = session_id
    var uri = 'http://' + IP + '/api/v1/vacation/' + vacationId + '/managerApproval/' + approvalId
    console.log("uri::" + uri)
    var approvalBody = {
      "id": approvalId,
      "comments": "From Ibrahim",
      "state": status,
      "type": "MANAGER"

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
      requestify.post('http://' + IP + '/api/v1/toffy', {
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
          url: "http://" + IP + "/api/v1/toffy/" + JSON.parse(body).id, //URL to hitDs
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': 'JSESSIONID=24D8D542209A0B2FF91AB2A333C8FA70'
          },
          body: email
          //Set the body as a stringcc
        }, function (error, response, body) {
          console.log("DELETEd");

        });
        console.log("=====>arrive3")
        requestify.post('http://' + IP + '/api/v1/toffy', {
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
  managerToffyHelper.getRoleByEmail(emailValue, "ADMIN", function (role) {
    if (role == true) {
      storeManagerSlackInformation(emailValue, msg);
      var text = msg.body.event.text;

      let apiaiRequest = apiAiService.textRequest(text,
        {
          sessionId: sessionId
        });

      apiaiRequest.on('response', (response) => {
        let responseText = response.result.fulfillment.speech;
        /* if (responseText == "WhoIsOff") {
           var WhoIsOffCase = ""
           if (response.result.parameters.off_synonyms && response.result.parameters.date && response.result.parameters.date1) {
             var date = response.result.parameters.date
             var date1 = response.result.parameters.date1
             WhoIsOffCase = 1
             managerToffyHelper.showWhoIsOff(msg, emailValue, date, date1)
 
 
           }
           else if (response.result.parameters.off_synonyms && response.result.parameters.date) {
             var date = response.result.parameters.date;
             DateHelper.getPreviousDate(date, 1, function (previousDate) {
               WhoIsOffCase = 2
               managerToffyHelper.showWhoIsOff(msg, emailValue, date, date)
 
             })
 
           }
           console.log("WhoIsOffCase" + WhoIsOffCase)
         }*/
        if (responseText == "whoIsOff") {
          console.log("arrive")
          whoIsOff.whoIsOff(msg, response, emailValue)
        }
        else if (responseText == "showEmployeeInfo") {
          console.log("eresponse:::" + JSON.stringify(response))
          console.log("employeeEmail:  ::" + response.result.parameters.email)
          console.log("response.result.parameters.any" + response.result.parameters.any)
          console.log("generalEmail" + generalEmail)
          console.log("generalEmailForEmpInfo" + generalEmailForEmpInfo)
          var employeeEmail = "";
          if (response.result.parameters.any || generalEmailForEmpInfo != "" || generalEmail != "") {
            console.log("Case1")


            employeeEmail = response.result.parameters.any + "@exalt.ps"
            employeeEmail = employeeEmail.replace(/ /g, ".");

            generalEmailForEmpInfo = employeeEmail
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
              employee.showEmployeeHistory(emailValue, generalEmailForEmpInfo, msg)
              generalEmailForEmpInfo = ""
              generalEmpInfo = ""
              generalEmail = ""

            }
            // else employee.showEmployeeProfile(emailValue, employeeEmail, msg)
            else {
              msg.say("Please specify on of the following :profile,stats or history ")
            }




          }
          else if (response.result.parameters.email || generalEmailForEmpInfo != "" || generalEmail != "") {
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
              employee.showEmployeeHistory(emailValue, generalEmailForEmpInfo, msg)
              generalEmailForEmpInfo = ""
              generalEmpInfo = ""
              generalEmail = ""

            }
            // else employee.showEmployeeProfile(emailValue, employeeEmail, msg)
            else {
              msg.say("Please specify on of the following :profile, stats, history or pending ")
            }

          } else if (!(response.result.parameters.any || response.result.parameters.email) && response.result.parameters.employee_info_types) {
            msg.say("Please specify employee email")
            generalEmpInfo = response.result.parameters.employee_info_types
            console.log("Arriveee" + generalEmpInfo)
          }
        }




        else if (responseText == "vacationWithLeave") {
          var messageText = ""
          var employeeEmail = ""
          managerToffyHelper.getTodayDate(function (today) {
            var time1 = "17:00:00";
            var time = "08:00:00";
            var date = today
            var date1 = today
            var timeOffCase = -1
            var flag = 1
            if (!(response.result.parameters.email || response.result.parameters.any || generalEmail != "" || response.result.parameters.whoIsOff) && generalEmpInfo == "") {
              msg.say("please specify the user email with request")
            } else {
              if (response.result.parameters.email) {
                //<mailto:ibrahim.zahra@exalt.ps|ibrahim.zahra@exalt.ps>
                if ((response.result.parameters.email).indexOf('mailto') > -1) {
                  employeeEmail = response.result.parameters.email
                  employeeEmail = employeeEmail.toString().split('|')
                  employeeEmail = employeeEmail[1];
                  employeeEmail = employeeEmail.replace(/>/g, "");
                  console.log("Email after split mail to ")
                  generalEmail = employeeEmail
                  isInfo = 1
                }
                else {
                  employeeEmail = response.result.parameters.email
                  generalEmail = employeeEmail;
                }


              } else if (response.result.parameters.any) {
                /* if ((response.result.parameters.any).indexOf('.') < 0) {
 
                   msg.say("Sorry ,I cant understand you ")
                 } else {*/


                employeeEmail = response.result.parameters.any
                employeeEmail = response.result.parameters.any + "@exalt.ps"
                employeeEmail = employeeEmail.replace(/ /g, ".");
                generalEmail = employeeEmail
                isInfo = 1




              }


              if (response.result.parameters.sick_synonyms) {
                vacation_type1 = "sick"
              }
              if (isInfo == 1 && generalEmpInfo != "") {
                console.log
                employee.determineInfoType(emailValue, employeeEmail, generalEmpInfo, msg)
                console.log("generalEmpInfo" + generalEmpInfo)
                console.log("employeeEmail" + employeeEmail)
                generalEmpInfo = ""
                employeeEmail = ""
                generalEmail = ""


              }
              /*  else if ((response.result.parameters.any).indexOf('.') < 0 || (response.result.parameters.any).indexOf('tareq') < 0 || (response.result.parameters.any).indexOf('Tareq') < 0) {
                  console.log("response.result.parameters.any).indexOf('.') " + (response.result.parameters.any).indexOf('.'))
                  msg.say("Sorry ,I cant understand you ")
                }*/

              else if (response.result.parameters.time_off_types && !(response.result.parameters.time) && !(response.result.parameters.time1) && !(response.result.parameters.date) && !(response.result.parameters.date1)) {

                msg.say("Please specify the date and/or time ")



              }
              else if (response.result.parameters.sick_synonyms && !(response.result.parameters.time) && !(response.result.parameters.time1) && !(response.result.parameters.date) && !(response.result.parameters.date1)) {
                msg.say("Please specify the date and/or time ")


                vacation_type1 = "sick"

              } else if (!(response.result.parameters.time) && !(response.result.parameters.time1) && !(response.result.parameters.date) && !(response.result.parameters.date1)) {
                msg.say("Please specify the date and/or time ")
              }
              else {

                if (response.result.parameters.time && response.result.parameters.time1 && response.result.parameters.date && response.result.parameters.date1) {
                  time = response.result.parameters.time
                  time1 = response.result.parameters.time1
                  date = response.result.parameters.date;
                  date1 = response.result.parameters.date1;

                  timeOffCase = 1

                }
                else if (response.result.parameters.time && response.result.parameters.time1 && response.result.parameters.date1) {
                  time = response.result.parameters.time
                  time1 = response.result.parameters.time1
                  date = response.result.parameters.date1
                  date1 = response.result.parameters.date1

                  timeOffCase = 2

                } else if (response.result.parameters.time && response.result.parameters.time1 && response.result.parameters.date) {
                  time = response.result.parameters.time
                  time1 = response.result.parameters.time1
                  date = response.result.parameters.date
                  date1 = response.result.parameters.date
                  timeOffCase = 3

                }

                else if (response.result.parameters.time && response.result.parameters.date && response.result.parameters.date1) {
                  time = response.result.parameters.time
                  time1 = response.result.parameters.time1
                  date = response.result.parameters.date
                  date1 = response.result.parameters.date1
                  timeOffCase = 4

                } else if (response.result.parameters.time && response.result.parameters.time1) {
                  time = response.result.parameters.time
                  time1 = response.result.parameters.time1
                  timeOffCase = 5

                } else if (response.result.parameters.time && response.result.parameters.date) {
                  time = response.result.parameters.time
                  date = response.result.parameters.date
                  date1 = response.result.parameters.date
                  timeOffCase = 6

                }
                else if (response.result.parameters.time && response.result.parameters.date1) {
                  time = response.result.parameters.time
                  date1 = response.result.parameters.date1
                  timeOffCase = 7

                }
                else if (response.result.parameters.date && response.result.parameters.date1) {
                  date = response.result.parameters.date
                  date1 = response.result.parameters.date1
                  timeOffCase = 8

                }
                else if (response.result.parameters.date) {
                  date = response.result.parameters.date
                  date1 = response.result.parameters.date
                  timeOffCase = 9

                }
                else if (response.result.parameters.time) {
                  time = response.result.parameters.time
                  timeOffCase = 10

                } else {
                  flag = 0
                }
                if (flag == 1) {
                  date1 = date1.replace(/-/g, "/")
                  date = date.replace(/-/g, "/")


                  if (vacation_type1 == "") {
                    vacation_type1 = "personal"
                  }
                  //get the milliseconds for the  end of the vacation 
                  managerToffyHelper.convertTimeFormat(time, function (x, y, convertedTime) {
                    managerToffyHelper.convertTimeFormat(time1, function (x, y, convertedTime1) {
                      var fromDate = date + " " + convertedTime;
                      var toDate = date1 + " " + convertedTime1

                      console.log("toDate::" + toDate);
                      console.log("fromDate::" + fromDate);
                      toDate = new Date(toDate);

                      console.log("timeMilliseconds" + toDate)

                      var dateMilliSeconds = toDate.getTime();
                      dateMilliSeconds = dateMilliSeconds - (3 * 60 * 60 * 1000);


                      var timeMilliseconds = new Date(fromDate);
                      console.log("timeMilliseconds" + timeMilliseconds)

                      timeMilliseconds = timeMilliseconds.getTime();
                      timeMilliseconds = timeMilliseconds - (3 * 60 * 60 * 1000);
                      console.log("timeMilliseconds :: :" + timeMilliseconds)
                      if (response.result.parameters.whoIsOff) {
                        managerToffyHelper.showWhoIsOff(msg, emailValue, timeMilliseconds, timeMilliseconds)

                      } else {

                        managerToffyHelper.sendVacationWithLeaveConfirmation(msg, convertedTime, date, convertedTime1, date1, timeMilliseconds, dateMilliSeconds, emailValue, generalEmail, vacation_type1, timeOffCase)
                        vacation_type1 = ""
                        generalEmail = ""
                      }

                    })

                  })

                } else msg.say("Error in request")

              }
            }
          })

        }
        else if ((responseText) == "Help") {

          managerToffyHelper.sendHelpOptions(msg);
        }
        else if (responseText == "Reminders") {
          getTodayDate(function (today) {
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
    }


    else {
      msg.say("Sorry!.You dont have the permession to use this bot.")
    }

  })

}
/** */
function getTodayDate(callback) {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();

  if (dd < 10) {
    dd = '0' + dd
  }

  if (mm < 10) {
    mm = '0' + mm
  }

  today = yyyy + '/' + mm + '/' + dd;
  callback(today)
}


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
  if (msg.body.event.user == "U3R213B2L") {

    console.log("message from bot")
    var stringfy = JSON.stringify(msg);
    console.log("the message is ");
    console.log(stringfy);

  } else {


    var stringfy = JSON.stringify(msg);
    console.log("the message is ");
    console.log(stringfy);
    getMembersList(msg.body.event.user, msg)
  }
})


slapp.action('manager_confirm_reject', 'confirm', (msg, value) => {
  managerApproval1(msg, value, "Approved", 0, "")
})



slapp.action('manager_confirm_reject', 'reject', (msg, value) => {
  managerApproval1(msg, value, "Rejected", 0, "")
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
  vacationHelper.getVacationState(managerEmail, vacationId, function (state) {
    if (state == 404) {
      replaceMessage.replaceCanceledRequestOnAction(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)
    } else if (state == 200) {
      // replaceMessage.replaceMessageOnCheckState(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)
      vacationHelper.getSecondApproverStateAndFinalState(managerEmail, vacationId, 0, function (approver2Email, approver2Action, vacationState) {
        vacationHelper.getSecondApproverStateAndFinalState(managerEmail, vacationId, 1, function (myEmail, myAction, vacationState) {
          replaceMessage.replaceMessageOnCheckState(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays, approver2Email, approver2Action, vacationState, myAction)

        })
      })
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
  var managerId = ""
  getTodayDate(function (todayDate) {
    var fromDate = ""
    var toDate = ""
    arr = value.toString().split(",");
    type = arr[5]
    managerEmail = arr[2];
    fromDateInMilliseconds = arr[3];
    toDateInMilliseconds = arr[4]
    workingDays = arr[6]
    fromDate = arr[7]
    toDate = arr[8]
    employeeEmail = arr[9]
    managerId = arr[10]
    managerToffyHelper.sendVacationPostRequest(/*from  */fromDateInMilliseconds, toDateInMilliseconds, managerToffyHelper.userIdInHr, employeeEmail, type, function (vacationId, managerApproval) {

      managerToffyHelper.convertTimeFormat(arr[0], function (formattedTime, midday) {

        managerToffyHelper.convertTimeFormat(arr[1], function (formattedTime1, midday1) {

          if (arr[0] && (arr[0] != undefined)) {
            fromDate = fromDate + " at " + formattedTime + " " + midday
          } else fromDate = fromDate + " at 08:00 am ";

          if (arr[1] && (arr[1] != undefined)) {
            toDate = toDate + " at " + formattedTime1 + " " + midday1
          } else toDate = toDate + " at 05:00 pm ";


          if (!managerApproval[0]) {
            msg.say(" dont have any manager right now ");
          } else {
            console.log("fromDate:::-->" + fromDate)
            console.log("toDate:::-->" + toDate)
            managerToffyHelper.sendVacationToManager(fromDate, toDate, managerEmail, type, vacationId, managerApproval, "Manager", workingDays)

            if (type == "sick") {
              console.log("Managers approvals sick vacation is ::" + JSON.stringify(managerApproval))
              msg.respond(msg.body.response_url, "Your  request has been submitted . ")

            }
            else
              msg.respond(msg.body.response_url, "Your time off request for " + employeeEmail + " from ( " + fromDate + "- " + toDate + " ) has been submitted.")

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
function managerApproval1(msg, value, approvalType, fromManager, comment) {

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

  sendVacationPutRequest(vacationId, approvalId, managerEmail, approvalType, function (isDeleted) {
    if (isDeleted == false) {
      if (fromManager != 1) {
        request({
          url: 'http://' + IP + '/api/v1/toffy/get-record', //URL to hitDs
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': 'JSESSIONID=24D8D542209A0B2FF91AB2A333C8FA70'
          },
          body: userEmail
          //Set the body as a stringcc
        }, function (error, response, body) {
          var responseBody = JSON.parse(body);
          managerToffyHelper.getNewSessionwithCookie(managerEmail, function (remember_me_cookie, session_id) {


            var uri = 'http://' + IP + '/api/v1/vacation/' + vacationId
            request({
              url: uri, //URL to hitDs
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Cookie': remember_me_cookie + ";" + session_id

              }
              //Set the body as a stringcc
            }, function (error, response, body) {
              messageSender.sendMessagetoEmpOnAction(msg, managerEmail, fromDate, toDate, userEmail, type, bot, approvalType, body, typeText, responseBody, comment);
              replaceMessage.replaceMessage(msg, userEmail, managerEmail, fromDate, toDate, type, approvalType, vacationId, approvalId, ImageUrl, typeText, workingDays)

            });
          })
        })
      }
    }
    else replaceMessage.replaceCanceledRequestOnAction(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)

  })
}





slapp.action('leave_with_vacation_confirm_reject', 'confirm', (msg, value) => {
  managerAction(msg, value, "Approved")
})

slapp.action('leave_with_vacation_confirm_reject', 'confirm_without_detuction', (msg, value) => {
  managerAction(msg, value, "ApprovedWithoutDeduction")
})
slapp.action('leave_with_vacation_confirm_reject', 'reject', (msg, value) => {
  msg.say("Ok, operation aborted.")
  fromDate = "";
  toDate = "";
})//Undo action
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
  replaceMessage.undoAction(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)
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
  replaceMessage.replaceWithComment(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)
})
slapp.action('manager_confirm_reject', 'Send_comment', (msg, value) => {
  var arr = value.toString().split(";")
  var comment = arr[10]

  managerApproval1(msg, value, "Rejected", 0, comment)
})
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

app.get('/', function (req, res) {
  var clientIp = requestIp.getClientIp(req);
  console.log("new request ");
  console.log(clientIp)
  res.send('Hello1')
})


console.log('Listening on :' + process.env.PORT)
app.listen(process.env.PORT)
