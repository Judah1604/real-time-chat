import React, { useEffect, useState } from "react";

function Interface() {
	const [messages, setMessages] = useState([]);
	const [ws, setWs] = useState(null);
	const [inputValue, setInputValue] = useState("");

	useEffect(() => {
		const socket = new WebSocket("ws://localhost:8080");
		setWs(socket);

		socket.onopen = () => {
			console.log("Connected to WebSocket server");
		};

		socket.onmessage = (event) => {
			const message = event.data;
            console.log(messages);
            console.log(message);
			setMessages((prevMessages) => [...prevMessages, message]);
		};

		socket.onclose = () => {
			console.log("Disconnected from WebSocket server");
		};

		return () => socket.close();
	}, []);

	function sendMessage() {
		if (ws && ws.readyState == WebSocket.OPEN) {
			ws.send(inputValue);
			setInputValue("");
		}
	}

	return (
		<div className="interface">
			<h1>Chat Interface</h1>
			<div className="messages">
				{messages.map((message, index) => (
					<p key={index}>{message}</p>
				))}
			</div>
			<input
				type="text"
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
			/>
			<button onClick={sendMessage}>Send</button>
		</div>
	);
}

export default Interface;
