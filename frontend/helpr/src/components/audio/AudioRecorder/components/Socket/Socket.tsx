// socket.js
import socketIOClient from 'socket.io-client';

const socket = socketIOClient(`${process.env.NEXT_PUBLIC_BACKEND_URL}`); // Replace with your backend URL
export default socket;
