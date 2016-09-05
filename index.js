'use strict';

// Imports
const BraviaRemoteControl = require ('./BraviaRemoteControl');
const Alexa = require ('./Alexa');

// Shortcuts to sequences that open app (depends on layout of items on tv)
const seqApps = 'down down down down ';
const seqOpenMLB = seqApps;
const seqOpenPlex = seqApps + 'down';
const seqOpenSling= seqApps + 'right';

class AlexaBravia extends Alexa {

	constructor(event, context, domain , port = 80) {
		super(event, context);
		this.extRemote = new BraviaRemoteControl('josh-rogan.dynu.com', 44444);
		this.localRemote = new BraviaRemoteControl('192.168.1.2', 80);
		this.remote = this.localRemote;
	}

	/**
	 * Open an application by calling a sequence to the remote
	 * @param  {string} name
	 * @return {Promise}
	 */
	openApp(appName) {
		switch (appName) {
			case 'plex':
				return this.remote.openAppSeq(seqOpenPlex, appName);
				break;
			case 'sling':
				return this.remote.openAppSeq(seqOpenSling, appName);
				break;
			case 'mlb':
				return this.remote.openAppSeq(seqOpenMLB, appName);
				break;
		}
	}

	/**
	 * Send commands to the TV such as home, exit, play, pause, mute, etc.
	 * @param  {String} commandName
	 * @return {Promise|boolean}
	 */
	command(commandName) {
		this.debugLog(`Sending command ${commandName}`);

		if(commandName === 'unmute') {
			return this.remote.sendAction('mute')
				.then( ()=> this.remote.sendAction('volumeup'));
		} else {
			if (this.remote.validAction(commandName)) {
				return this.remote.sendAction(commandName);
			}
		}

		return false;
	}

	/**
	 * Change volume X number of times
	 * @param  {Number} change difference for the volume
	 * @return {Promise}
	 */
	volumeControl(change = 1) {
		let command = change > 0 ? 'volumeUp' : 'volumeDown';
		let seq = '';
		change = Math.abs(change);

		for(let i = 0; i < command; i++) {
			seq += `${command} `;
		}

		return this.remote.sendActionSequence(seq);
	}

	getActionValue() {
		return this.getSlotValue('Action');
	}

	/**
	 * Handle all incoming intents
	 * @return {[type]} [description]
	 */
	intentHandler() {
		let intent = this.getIntent();

		if(intent.name = 'SendActionIntent') {
			let action = this.getActionValue();
			if(action) {
				this.setTitle(`Sending action ${action}`);
				this.setSpeechOutput(`Sending action ${action}`);

				if(this.command(action)) {
					let speechlet = this.buildSpeechletResponse('Non Intent', 'No intent');
					let res = this.buildResponse(speechlet);
					this.success(res);
				} else {
					this.fail('Not a valid action');
				}
			} else {
				this.fail('Action not found');
			}
		} else {
			this.fail('Non Valid Intent');
		}
	}



	/**
	 * Handler that all requests are routed through
	 * @param  {object} event
	 * @param  {object} context
	 */
	static alexaHandler(event, context) {
		try {
			let alexa = new AlexaBravia(event, context);

			if (alexa.isIntent()) {
				alexa.intentHandler();
			} else {
				let speechlet = alexa.buildSpeechletResponse('Non Intent', 'No intent');
				let res = alexa.buildResponse(speechlet);
				alexa.success(res);
			}

		} catch (e) {
        	alexa.error(e);
		}
	}


	// TODO: Run a sequence of commands release 2.0
	sequence(sequenceString) { return 'stub' ;}
}

exports.handler = AlexaBravia.alexaHandler;

