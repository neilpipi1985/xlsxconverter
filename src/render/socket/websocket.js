import io from 'socket.io-client';

class Socket {
  constructor(opts = { }) {
    this.socket = io('', opts);
  }

  on(name, func) {
    this.socket.on(name, func);
  }

  send(name, opts = {}) {
    this.socket.emit(name, opts);
  }

  disconnect() {
    this.socket.disconnect();
    delete this.socket;
  }
}

export default Socket;
