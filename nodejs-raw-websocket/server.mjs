import { createServer } from 'http'
const PORT = 1337
const WEBSOCKET_MAGIC_STRING_KEY = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
const SEVEN_BITS_INTEGER_MARKER = 125
const SIXTEEN_BITS_INTEGER_MARKER = 126
const SIXTFOUR_BITS_INTEGER_MARKER = 127

const MASK_KEY_BYTES_LENGTH = 4;

// parseInt('10000000',2)
const FIRST_BIT = 128

import crypto from 'crypto'

const server = createServer(
    (request, response) => {
        response.writeHead(200)
        response.end('Hey there')
    }
)
    .listen(1337, () => console.log('server listening to', PORT))

server.on('upgrade', onSocketUpgrade)

function onSocketUpgrade(req, socket, head) {
    const {
        'sec-websocket-key': webClientSoketKey
    } = req.headers
    console.log(`${webClientSoketKey} connected!`)
    const headers = prepareHandShakeHeaders(webClientSoketKey)

    socket.write(headers)
    socket.on('readable', () => onSocketReadable(socket))
}

function onSocketReadable(socket) {
    // consume optcode (first byte)
    // 1 - 1 byte - 8bits
    socket.read(1)

    const [markerAndPayloadLength] = socket.read(1)
    // Because the first bit is always 1 for client-to-server-messages
    // you can subtract one bit (128, or 10000000) 
    //from this byte to get rid of the MASK bit
    const lengthIndicatorBits = markerAndPayloadLength - FIRST_BIT

    let messageLength = 0
    if (lengthIndicatorBits <= SEVEN_BITS_INTEGER_MARKER) {
        messageLength = lengthIndicatorBits
    } else {
        throw new Error(`your message is too long! we don't handle 64-bit messages`)
    }

    const maskKey = socket.read(MASK_KEY_BYTES_LENGTH)
    const encoded = socket.read(messageLength)
    console.log()
}

function unmask(encodedData, maskKey) {
    var DECODED = "";
    for (let i = 0; i < ENCODED.length; i++) {
        DECODED[i] = ENCODED[i] ^ MASK[i % 4];

    }
}

function prepareHandShakeHeaders(id) {
    const acceptKey = createSocketAccept(id)
    const headers = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept:${acceptKey}`,
        ''
    ].map(line => line.concat('\r\n')).join('')
    return headers
}

function createSocketAccept(id) {
    const shaum = crypto.createHash('sha1')
    shaum.update(id + WEBSOCKET_MAGIC_STRING_KEY)
    return shaum.digest('base64')
}

// Error handling to keep the server on
;
[
    "uncaughtException",
    "unhandledRejection",
].forEach(event =>
    process.on(event, (err) => {
        console.error(`something bad happened! event: ${event}, msg: ${err.stack || err}`)
    })
)