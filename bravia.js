'use strict';

// Imports
const BraviaRemoteControl = require ('./BraviaRemoteControl');

// Shortcuts to sequences that open app (depends on layout of items on tv)
const seqApps = 'down down down down ';
const seqOpenMLB = seqApps;
const seqOpenPlex = seqApps + 'down';
const seqOpenSling= seqApps + 'right';


class AlexaBravia {

	constructor() {
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
	 * @param  {[type]} commandName [description]
	 * @return {[type]}             [description]
	 */
	command(commandName) {
		switch (commandName) {
		 	case 'home':
		  		return this.remote.sendAction('home');
				break;
		 	case 'play':
				return this.remote.sendAction('play');
				break;
		 	case 'pause':
		  		return this.remote.sendAction('pause');
				break;
			case 'exit':
		  		return this.remote.sendAction('exit');
				break;
			case 'mute':
		  		return this.remote.sendAction('mute');
				break;
			case 'unmute':
				return this.remote.sendAction('mute')
					.then( ()=> this.remote.sendAction('volumeUp'));
				break;
		}
	}

}

const alexa = new AlexaBravia();
alexa.openApp('sling');
// alexa.command('exit');
