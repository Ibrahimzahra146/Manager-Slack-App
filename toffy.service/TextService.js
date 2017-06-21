module.exports.prepareTextForApiAi = function prepareTextForApiAi(text, callback) {
    console.log("text" + text)
    var arr = text.toString().split('<')
    var first_part = arr[0]
    console.log("first_part" + first_part)
    arr = text.toString().split('>')
    var lasr_part = arr[1]
    console.log("lasr_part" + lasr_part)
    var mailPart = arr[0]
    console.log("mailPart" + mailPart)

    mailPart = mailPart.toString().split('|')
    mailPart = mailPart[1];
    mailPart = mailPart.replace(/@exalt.ps/g, "");
    mailPart = mailPart.replace(/>/g, "");
    console.log("mailPart" + mailPart)

    callback(text)
}