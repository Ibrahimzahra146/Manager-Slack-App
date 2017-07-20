'use strict'



var APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_KEY
exports.APIAI_ACCESS_TOKEN = APIAI_ACCESS_TOKEN;

const express = require('express')
exports.express = express;

const Slapp = require('slapp')
exports.Slapp = Slapp

const BeepBoopConvoStore = require('slapp-convo-beepboop')

const BeepBoopContext = require('slapp-context-beepboop')

const bodyParser = require('body-parser');
exports.bodyParser = bodyParser

const uuid = require('node-uuid');
exports.uuid = uuid

const request = require('request');
exports.request = request

const JSONbig = require('json-bigint');
exports.JSONbig = JSONbig

const async = require('async');
exports.async = async

const apiai = require('apiai');
exports.apiai = apiai

const mRequests = require('.././Requests/requests.js')
exports.mRequests = mRequests

var managerToffyHelper = require('.././managerToffyHelper.js')
exports.managerToffyHelper = managerToffyHelper

var employee = require('.././employeeSide.js');
exports.employee = employee

const dateHelper = require('.././DateEngine/DateHelper.js')
exports.dateHelper = dateHelper;

var server = require('.././server.js')
exports.server = server
/*const mRequests = require('.././Requests/Requests.js')
exports.mRequests = mRequests*/
var stringFile = require('.././strings.js')
exports.stringFile = stringFile

var Constants = require('.././Constants.js');
exports.Constants = Constants

var messageGenerator = require('.././messagesHelper/messageGenerator.js');
exports.messageGenerator = messageGenerator

const VacationConfirmationService = require('.././toffy.service/VacationConfirmationService.js')
exports.VacationConfirmationService = VacationConfirmationService
const vacationType = require('.././toffy.utils/VacationTypes.js')
exports.vacationType = vacationType


const VacationService = require('.././toffy.service/VacationService.js')
exports.VacationService = VacationService

const TextService = require('.././toffy.service/TextService.js')
exports.TextService = TextService

const PendingService = require('.././toffy.service/PendingRequestService.js')
exports.PendingService = PendingService

const VacationHelper = require('./Vacation.js')
exports.VacationHelper = VacationHelper


var apiAiService = apiai(APIAI_ACCESS_TOKEN);
exports.apiAiService = apiAiService

var IP = process.env.SLACK_IP;
exports.IP = IP

var SLACK_ACCESS_TOKEN = process.env.SLACK_APP_ACCESS_KEY;
exports.SLACK_ACCESS_TOKEN = SLACK_ACCESS_TOKEN

var sickFlag = "";
exports.sickFlag = sickFlag
var typeOfVacation = "";
exports.typeOfVacation = typeOfVacation
var fromDate = ""
exports.fromDate = exports
var toDate = "";
exports.toDate = toDate

var generalMsg = "";
exports.generalMsg = generalMsg
var salesforceCode = "";
var leaveFlag = "";
var count = 0;
var state = "init"
var session = "";
var token = "";
var generalId = "";
const APIAI_LANG = 'en';
var sessionId = uuid.v1();
exports.sessionId = sessionId
var requestify = require('requestify');
var pg = require('pg');

var APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_KEY;

var SLACK_BOT_TOKEN = process.env.SLACK_BOT_ACCESS_KEY;
var MANAGER_BOT_ACCESS_KEY = process.env.MANAGER_BOT_ACCESS_KEY;

exports.count = count;
pg.defaults.ssl = true;

if (!process.env.PORT) throw Error('PORT missing but required')
var slapp = Slapp({
    convo_store: BeepBoopConvoStore(),
    context: BeepBoopContext()
})
exports.slapp = slapp

var Botkit = require('.././lib/Botkit.js');
var controller = Botkit.slackbot({
    debug: true,
});
var controller1 = Botkit.slackbot({
    debug: true,
});
var bot = controller.spawn({
    token: SLACK_BOT_TOKEN

}).startRTM();
exports.bot = bot
var managerBot = controller1.spawn({
    token: MANAGER_BOT_ACCESS_KEY

}).startRTM();
exports.managerBot = managerBot

