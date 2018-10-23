import electron from 'electron';

class Socket {
  constructor() {
    this.socket = electron.ipcRenderer;
  }

  on(name, func) {
    this.socket.on(name, (sender, opts = {}) => func(opts));
  }

  send(name, opts) {
    this.socket.send(name, opts);
  }

  disconnect() {}
}

export default Socket;
