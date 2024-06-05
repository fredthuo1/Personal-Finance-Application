const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ noServer: true });

const broadcast = (data) => {
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

module.exports = { wss, broadcast };
