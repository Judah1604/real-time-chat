import { WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws) {
	console.log("Client connected!");

	ws.send("Welcome to my WebSocket server!");

	ws.on("message", (data) => {
		wss.clients.forEach(function each(client) {
			if (client !== ws && client.readyState === WebSocket.OPEN) {
				const message = data.toString();
				console.log(message);
				client.send(message);
			}
		});
	});

	ws.on("close", () => {
		console.log("Client disconnected");
	});
});

console.log("WebSocket server running on ws://localhost:8080");
