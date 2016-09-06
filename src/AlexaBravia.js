'use strict';

// Imports
const BraviaRemoteControl = require ('./BraviaRemoteControl');
const Alexa = require ('./Alexa');

// Shortcuts to sequences that open app (depends on layout of items on tv)
const seqGetToApps = 'down down' + ' ';

// Unique to me
const apps = {
	mlb: seqGetToApps,
	plex: seqGetToApps + 'down',
	sling: seqGetToApps + 'right',
};

class AlexaBravia extends Alexa {

	constructor(event, context, domain , port = 80) {
		super(event, context);
		this.extRemote = new BraviaRemoteControl('josh-rogan.dynu.com', 44444);
		this.localRemote = new BraviaRemoteControl('192.168.1.2', 80);
		this.remote = this.extRemote;
	}

	/**
	 * Open an application by calling a sequence to the remote
	 * @param  {string} name
	 * @return {Promise}
	 */
	openApp(appName) {
		if (this.isValidAppName(appName)) {
			return this.remote.openAppSeq(apps[appName], appName);
		}

		return false;
	}

	/**
	 * Checks if a potential app name is valid
	 * @param  {String}  appName
	 * @return {Boolean}
	 */
	isValidAppName(appName) {
		return apps[appName] !== undefined;
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

	/**
	 * Get the action value in the slot
	 * @return {String|Boolean}
	 */
	getActionValue() {
		return this.getSlotValue('Action');
	}

	/**
	 * Get the app name value in the slot
	 * @return {String|Boolean}
	 */
	getAppNameValue() {
		return this.getSlotValue('AppName');
	}

	/**
	 * Handle all incoming intents
	 * @return {[type]} [description]
	 */
	intentHandler() {
		let intent = this.getIntent();

		if(this.getIntentName() == 'SendActionIntent') {
			let action = this.getActionValue();

			if(action) {
				this.setTitle(`Sending action ${action}`);
				this.setSpeechOutput(`Sending action ${action}`);

				if(this.command(action)) {
					this.success();
				} else {
					this.fail('Not a valid action');
				}
			} else {
				this.fail('Action not found');
			}

		} else if (this.getIntentName() == 'OpenAppIntent') {
			let appName = this.getAppNameValue();

			if(this.isValidAppName(appName)) {
				this.setTitle(`Opening app ${appName}`);
				this.setSpeechOutput(`Opening app ${appName}`);
				this.openApp(appName);
				this.success();
			} else {
				this.fail(`${appName} is not a valid app name.`);
			}

		} else {
			this.fail('Non Valid Intent');
		}

	}

	/**
	 * Handler that all requests are routed through should be outside of this
	 * @param  {object} event
	 * @param  {object} context
	 */
	static alexaHandler(event, context) {
		try {
			let alexa = new AlexaBravia(event, context);

			if (alexa.isIntent()) {
				alexa.intentHandler();
			} else {
				alexa.setAlexa(`Welcome`, `Welcome to the tv remote control app!`);
				alexa.success();
			}

		} catch (e) {
        	alexa.error(e);
		}
	}


	// TODO: Run a sequence of commands release 2.0
	sequence(sequenceString) { return 'stub' ;}
}

module.exports = AlexaBravia;