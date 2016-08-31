const http = require('http');

const braviaIRCCEndPoint = '/sony/IRCC';
let actionMap = {
	power: 'AAAAAQAAAAEAAAAVAw==',
	home: 'AAAAAQAAAAEAAABgAw==',
	down: 'AAAAAQAAAAEAAAB1Aw==',
	up: 'AAAAAQAAAAEAAAB0Aw==',
	left: 'AAAAAQAAAAEAAAA0Aw==',
	right: 'AAAAAQAAAAEAAAAzAw==',
	confirm: 'AAAAAQAAAAEAAABlAw==',
	exit: 'AAAAAQAAAAEAAABjAw==',
};


class BraviaRemoteControl {

	/**
	 * Create a bravia remote control instance
	 * @param  {String} domain
	 * @param  {Number} port
	 * @param  {String} authKey
	 * @return {BraviaRemoteControl}
	 */
	constructor(domain, port, authKey = '0000') {
		this.debug = false;
		this.domain = domain;
		this.port = port;
		this.authKey = authKey;
		this.activeRequest = false;
		this.activeSequence = false;
	}

	/**
	 * Send a sequence of commands
	 * @param  {String} actionKeySeq sequence of commands e.g 'down up left right'
	 */
	sendIRCCSignalSeq(actionKeySeq) {
		let commands = actionKeySeq.split(' ');

		// Fire off the commands one after another
		return new Promise((res, reject) => {
			this.activeSequence = true;
			let index = 0;

			let next = () => {
				if (index < commands.length) {
					this.sendIRCCSignal(commands[index++]).then(next, reject);
				} else {
					console.log(`Sequence '${actionKeySeq}' finished.`);
					this.activeSequence = false;
					resolve();
				}
			}

			next();
		});

	}

	/**
	 * Send an IRCC signal to the TV
	 * @param  {String} actionKey
	 * @param  {Function} callback
	 * @return {[type]}           [description]
	 */
	sendIRCCSignal(actionKey) {
		return this.sendDirectIRCCSignal(BraviaRemoteControl.getIRCCCode(actionKey));
	}

	/**
	 * Send an IRCC signal to the TV
	 * @param  {String} actionKey
	 * @param  {Function} callback
	 * @return {Promise}
	 */
	sendDirectIRCCSignal(IRCCCode) {
		let body = this.getIRCCCodeXMLBody(IRCCCode);
		let options = this.getRequestOptions();
		return this.sendHTTPRequest(options, body);
	}

	/**
	 * Send an HTTP Request to a Bravia TV
	 * @param  {Object} options
	 * @param  {String} body
	 * @return {Promise}
	 */
	sendHTTPRequest(options, body) {
		return new Promise((resolve, reject) => {
			let req = http.request(options, (res) => {
				this.activeRequest = true;

				this.debugLog(`STATUS: ${res.statusCode}`);
				this.debugLog(`HEADERS: ${JSON.stringify(res.headers)}`);
				res.setEncoding('utf8');

				res.on('data', (chunk) => {
					this.debugLog(`BODY: ${chunk}`);
				});

				res.on('end', () => {
					this.activeRequest = false;
					resolve();
				});
			});

			req.on('error', (e) => {
				reject(`problem with request: ${e.message}`);
			});

			req.write(body);
			req.end();
		});
	}

	/**
	 * Build the HTTP request options
	 * @return {Object}
	 */
	getRequestOptions() {
		return {
			hostname: this.domain,
			port: this.port,
			path: braviaIRCCEndPoint,
			method: 'POST',
			headers: {
				'Content-Type': 'text/xml',
				'soapaction': '"urn:schemas-sony-com:service:IRCC:1#X_SendIRCC"',
				'x-auth-psk': this.authKey
			}
		}
	}

	/**
	 * Get the xml body for the http response sent to the bravia television
	 * @param  {String} IRCCCode
	 * @return {String}
	 */
	getIRCCCodeXMLBody(IRCCCode) {
		return `<?xml version="1.0"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body><u:X_SendIRCC xmlns:u="urn:schemas-sony-com:service:IRCC:1"><IRCCCode>${IRCCCode}</IRCCCode></u:X_SendIRCC></s:Body></s:Envelope>`;
	}


	/**
	 * Simple debug logger
	 */
	debugLog() {
		if (this.debug) {
			console.log(...arguments);
		}
	}

	/**
	 * Get the remote IRCCCode control values
	 * @param  {String} actionName
	 * @return {String|Boolean} IRCCCode
	 */
	static getIRCCCode(actionName) {
		return actionMap[actionName] ? actionMap[actionName] : false;
	}



}

const remote = new BraviaRemoteControl('josh-rogan.dynu.com', 44444);
const localRemote = new BraviaRemoteControl('192.168.1.2', 80);
remote.sendIRCCSignalSeq('left up right');

// localRemote.sendIRCCSignal('up');
// localRemote.sendIRCCSignal('up');
// localRemote.sendDirectIRCCSignal('AAAAAQAAAAEAAABgAw==');
// remote.sendIRCCSignal('power');