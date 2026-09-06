import { useEffect, useState } from "react";
import "../styles/interface.css";

function Interface() {
	const [messages, setMessages] = useState([]);
	const [ws, setWs] = useState(null);
	const [inputValue, setInputValue] = useState("");
	const [id, setId] = useState("");

	useEffect(() => {
		const socket = new WebSocket("ws://localhost:8080");
		setWs(socket);

		socket.onopen = () => {
			console.log("Connected to WebSocket server");
		};

		socket.onmessage = (event) => {
			if (event.data.includes("userid")) {
				setId(event.data.replace("userid", "").trim());
				console.log("ID is: " + id);
			} else {
				const data = JSON.parse(event.data);
				const id = data.id;
				const message = data.message;
				console.log(id, message);

				setMessages((prevMessages) => [...prevMessages, data]);
			}
		};

		socket.onclose = () => {
			console.log("Disconnected from WebSocket server");
		};

		return () => socket.close();
	}, []);

	function sendMessage() {
		if (!inputValue.trim()) return;

		if (ws && ws.readyState == WebSocket.OPEN) {
			ws.send(inputValue);
			setInputValue("");
		}
	}

	function checkIfSender(textID) {
		console.log(textID);
		if (textID == id) {
			return "message-wrap sender";
		} else {
			return "message-wrap receiver";
		}
	}

	return (
		<div className="interface">
			<h1>Chat Interface</h1>
			<p>Welcome to the server</p>
			<p>Your ID is {id == "" ? "undefined" : id}</p>
			<div className="messages">
				{messages.map((text, index) => (
					<div className={checkIfSender(text.id)}>
						<p key={index} className="message">
							<span>{text.id}: </span>
							{text.message}
						</p>
					</div>
				))}
			</div>
			<input
				type="text"
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						sendMessage();
					}
				}}
			/>
			<button onClick={sendMessage}>Send</button>
		</div>
	);
}

export default Interface;
