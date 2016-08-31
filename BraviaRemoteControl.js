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
		this.domain = domain;
		this.port = port;
		this.authKey = authKey;
	}

	/**
	 * Send a sequence of commands
	 * @param  {String} actionKeySeq sequence of commands e.g 'down up left right'
	 */
	sendIRCCSignalSeq(actionKeySeq) {
		let commands = actionKeySeq.split(' ');

		// Needs to be synchournous
		for (let command of commands) {
			this.sendIRCCSignal(command);
		}
	}

	/**
	 * Send an IRCC signal to the TV
	 * @param  {String} actionKey
	 * @param  {Function} callback
	 * @return {[type]}           [description]
	 */
	sendIRCCSignal(actionKey, callback) {
		return this.sendDirectIRCCSignal(BraviaRemoteControl.getIRCCCode(actionKey), callback);
	}

	/**
	 * Send an IRCC signal to the TV
	 * @param  {String} actionKey
	 * @param  {Function} callback
	 * @return {[type]}           [description]
	 */
	sendDirectIRCCSignal(IRCCCode, callback) {
		let body = this.getIRCCCodeXMLBody(IRCCCode);
		let options = this.getRequestOptions();

		this.sendHTTPRequest(options, body, () => {console.log('Done')});
	}


	/**
	 * Send an HTTP request to a bravia TB
	 * @param  {Object}   options
	 * @param  {String}   body
	 * @param  {Function} callback
	 */
	sendHTTPRequest(options, body, callback) {
		let req = http.request(options, (res) => {
			console.log(`STATUS: ${res.statusCode}`);
			console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
			res.setEncoding('utf8');

			res.on('data', (chunk) => {
				console.log(`BODY: ${chunk}`);
			});

			res.on('end', () => {
				console.log('No more data in response.');
				if(callback) callback();
			});
		});

		req.on('error', (e) => {
		  console.log(`problem with request: ${e.message}`);
		});

		req.write(body);
		req.end();
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
	 * Get the remote IRCCCode control values
	 * @param  {String} actionName
	 * @return {String|Boolean} IRCCCode
	 */
	static getIRCCCode(actionName) {
		return actionMap[actionName] ? actionMap[actionName] : false;
	}

}

const remote = new BraviaRemoteControl('josh-rogan.dynu.com', 4444);
const localRemote = new BraviaRemoteControl('192.168.1.2', 80);
localRemote.sendIRCCSignalSeq('home home home down down down down down confirm');
// localRemote.sendIRCCSignal('up');
// localRemote.sendIRCCSignal('up');
// localRemote.sendDirectIRCCSignal('AAAAAQAAAAEAAABgAw==');
// remote.sendIRCCSignal('power');