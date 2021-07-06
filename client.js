import { Socket } from "net";
import readline from "readline";
import path from "path";

const __filename = path.basename(new URL(import.meta.url).pathname);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const connect = (host, port) => {
  const socket = new Socket();

  socket.connect({ host, port }, () => {
    console.log("Connecting...");
  });

  socket.setEncoding("utf-8");

  socket.on("connect", () => {
    console.log(
      "You're connect, to end the connection write 'Ctrl + c' in console..."
    );

    rl.question("Choose your username -> ", (username) => {
      socket.write(username.trim());
      console.log("-> Type any message to send it: ");
    });

    rl.on("line", (message) => {
      socket.write(message.trim());
    });

    rl.on("close", () => {
      console.log("-> Bye!");
      socket.end();
    });

    socket.on("data", (data) => {
      console.log(data);
    });
  });

  socket.on("error", (err) => {
    if (err.code === "ECONNREFUSED") {
      error(
        "The connection has been rejected, make sure the server is working"
      );
    }
    error(err.message);
  });

  socket.on("close", () => process.exit(0));
};

const error = (message) => {
  console.log(message);
  process.exit(1);
};

const main = () => {
  if (process.argv.length !== 4) {
    error(`Usage: node ${__filename} host port`);
  }

  let [, , host, port] = process.argv;

  if (isNaN(port)) {
    error(`invalid port ${port}`);
  }

  port = parseInt(port);

  connect(host, port);
};

main();
