'use strict';

// Base Class
class Alexa {

	constructor(event, context) {
		this.debug = false;
		this.event = event;
		this.context = context;
		this.sessionAttributes = {};

		// Default responses
		this.title = 'Default Title';
		this.speechOutput = 'Default Speech Output';
		this.repromptText = 'Default Reprompt';
		this.shouldEndSession = true;
	}

	getIntent() {
		return this.event.request.intent;
	}

	getIntentName() {
		return this.getIntent().name;
	}

	getSlots() {
		return this.getIntent().slots;
	}

	getSlotValue(name) {
		return this.hasSlot(name) ? this.getSlots()[name].value.toLowerCase() : false;
	}

	hasSlot(name) {
		return this.getSlots()[name] !== undefined;
	}

	isIntent() {
		return this.event.request.type === "IntentRequest";
	}


	/***************************************** SETTING UP SPEECHLET *****************************************/

	setAlexa(title, speechOutput, repromptText = 'Default Reprompt', shouldEndSession = true) {
		this.setTitle(title);
		this.setSpeechOutput(speechOutput);
		this.setRepromptText(repromptText);
		this.setShouldEndSession(shouldEndSession);
	}

	setTitle(title) {
		return this.title = title;
	}

	setSpeechOutput(speechOutput) {
		return this.speechOutput = speechOutput;
	}

	setRepromptText(repromptText) {
		return this.repromptText = repromptText;
	}

	setShouldEndSession(shouldEndSession) {
		return this.shouldEndSession = shouldEndSession;
	}

	addSessionAttributes(name, value) {
		return this.sessionAttributes[name] = value;
	}

	/***************************************** SETTING UP SPEECHLET *****************************************/


	/**
	 * Get a speechlet response from the current set values
	 * @return {Object} an alexa response object
	 */
	getSpeechResponse() {
		let speechRes = this.buildSpeechletResponse();
		return this.buildResponse(speechRes);
	}


	/**
	 * Build an alexa response object
	 * @param  {object} response
	 * @param  {Object} sessionAttributes
	 * @return {Object}
	 */
	buildResponse(response) {
		return {
			version: "1.0",
			sessionAttributes: this.sessionAttributes,
			response: response
		};
	}

	/**
	 * Build a speech response
	 * @param  {String}  title
	 * @param  {String}  output
	 * @param  {String}  repromptText
	 * @param  {Boolean} shouldEnd
	 * @return {Object}
	 */
	buildSpeechletResponse() {
	    return {
	        outputSpeech: {
	            type: "PlainText",
	            text: this.speechOutput
	        },
	        card: {
	            type: "Simple",
	            title: "SessionSpeechlet - " + this.title,
	            content: "SessionSpeechlet - " + this.speechOutput
	        },
	        reprompt: {
	            outputSpeech: {
	                type: "PlainText",
	                text: this.repromptText
	            }
	        },
	        shouldEndSession: this.shouldEndSession
	    };
	}

	/**
	 * Send the request back using the context success handlers
	 */
	success() {
		let res = this.getSpeechResponse();
		this.debugLog('Sending Response:\n\n', res);
		this.context.succeed(res);
	}

	/**
	 * Send the request back using the context success handler but
	 * add the failure msg to the session attributes and a special failure title
	 * and speech response
	 * @param  {String} msg
	 */
	fail(msg = 'Failure') {
		console.log(`Failure ${msg}`);
		this.addSessionAttributes('failureMSG', msg);
		this.setAlexa(`Failure ${msg}`, `Failure due to error ${msg}`);
		this.success();
	}

	/**
	 * Fire alexa context faile
	 * @param  {mixed} error
	 */
	error(error) {
		console.log(error);
		this.context.fail(error);
	}

	debugLog() {
		if(this.debug) console.log(...arguments);
	}

	// Abstract must be impllmeneted
	static alexaHandler(event, context) { return {}; }

}

module.exports = Alexa;