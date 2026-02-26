import { io } from "socket.io-client";

const socket = io("https://campusconnect-90nf.onrender.com", {
  autoConnect: false,
});

export default socket;
