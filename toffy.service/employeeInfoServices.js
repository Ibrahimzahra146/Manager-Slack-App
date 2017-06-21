const env=require('.././public/configrations.js')

/**
 * 
 * 
 */
module.exports.getEmployeeSlackId=function getEmployeeSlackId(slackId,callback){
    env.mRequests.getSlackMembers(function(error,response,body){
        
    })
}
