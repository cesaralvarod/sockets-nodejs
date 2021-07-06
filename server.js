import { Server } from "net";
import path from "path";

const __filename = path.basename(new URL(import.meta.url).pathname);

const HOST = "0.0.0.0";

const connections = new Map();

const error = (message) => {
    console.log(message);
    process.exit(1);
};

const sendMessage = (message, origin, sender) => {
    for (const socket of connections.keys()) {
        if (socket !== origin) {
            socket.write(`${sender}: ${message.trim()}`);
        }
    }
};

const listen = (port) => {
    const server = new Server();

    // listen client

    server.on("connection", (socket) => {
        const remoteSocket = `${socket.remoteAddress}:${socket.remotePort}`;

        console.log(`New connection from ${remoteSocket}`);

        socket.setEncoding("utf-8"); // Para leer data de un binario

        socket.on("data", (message) => {
            if (!connections.has(socket)) {
                console.log(
                    `Username '${message.trim()}' set for connection ${remoteSocket}`
                );
                connections.set(socket, message);
            } else {
                const sender = `${remoteSocket} -> [${connections.get(
                    socket
                )}]`;

                sendMessage(message.trim(), socket, sender);
            }
        });

        socket.on("close", () => {
            connections.delete(socket);
            console.log(`${connections.get(socket)} left the connection`);
        });

        socket.on("error", (err) => {
            error(err);
        });
    });

    server.listen(
        {
            port,
            host: HOST,
        },
        () => console.log(`Listening on port ${port}`)
    );

    server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
            server.close();
            error("Address in use, use another");
        }
        error(err.message);
    });
};

const main = () => {
    // arguments

    if (process.argv.length !== 3) {
        error(`Usage: node ${__filename} port`);
    }

    let port = process.argv[2];

    if (isNaN(port)) {
        error(`Invalid port ${port}`);
    }

    port = parseInt(port);

    listen(port);
};

main();
