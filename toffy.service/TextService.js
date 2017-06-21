module.exports.prepareTextForApiAi = function prepareTextForApiAi(text, callback) {
    text = text.toString().split('|')
    text = text[1];

    text = text.replace(/@exalt.ps/g, "");
    text = text.replace(/>/g, "");
    callback(text)
}