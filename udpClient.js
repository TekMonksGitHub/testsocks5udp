/**
 * Test UDP client which uses SOCKS5 relay.
 * Sends an initial hello on connect, echoes responses and keeps
 * sending hellos back to them in response.
 * 
 * Needs socks NPM. npm install socks.
 */
const SocksClient = require('socks').SocksClient;
let info;

const udpSocket = require('dgram').createSocket('udp4');
udpSocket.bind();

const sendUDPMsg = _ => {
    const packet = SocksClient.createUDPFrame({remoteHost: { host: process.argv[3]||'127.0.0.1', port: process.argv[5]||4444 }, data: Buffer.from("Hello\n")});
    udpSocket.send(packet, info.remoteHost.port, info.remoteHost.host);
}

udpSocket.on('message', (msg, rinfo) => {
    console.log(`\n\nReceived new packet, rinfo is: ${JSON.stringify(rinfo)}`);
    const parsedMsg = SocksClient.parseUDPFrame(msg);
    console.log(`Parsed frame follows\n${JSON.stringify(parsedMsg)}`);
    console.log(`Decoded data is: ${parsedMsg.data.toString('utf8')}`);
    sendUDPMsg();
});

const associateOptions = { proxy: {host: process.argv[2]||'127.0.0.1', port: process.argv[4]||1080, type: 5}, command: 'associate', 
    destination: {host: process.argv[3]||'127.0.0.1', port: process.argv[5]||4444}, timeout: 600000 };
const client = new SocksClient(associateOptions);
client.on('established', socksinfo => {
    console.log(`Got connected to the UDP SOCKS5 Proxy\nInfo is: ${JSON.stringify(socksinfo)}`);
    info = socksinfo; sendUDPMsg();
});
client.connect();