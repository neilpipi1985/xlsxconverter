import SocketIO from 'socket.io';

const socketList = {};

class SocketMgr {
  static SocketIO(server, opts = {}) {
    return new SocketIO(server, opts);
  }

  static on(socket, eventName, func) {
    socket.on(eventName, func);
  }

  static joinRoom(socket, room) {
    socket['join'](room);
  }

  static leaveRoom(socket, room) {
    socket['leave'](room);
  }

  static getSocketPara(para, obj) {
    if (para[0] && para[0].sender) {
      return {
        action: 'send',
        sendFunc: para[0].sender,
        opts: para[1] || {},
        socket: socketList['render']
      };
    }

    return {
      action: 'emit',
      sendFunc: obj,
      opts: para[0] || {},
      socket: obj
    };
  }

  static send(socketPara = SocketMgr.getSocketPara(), eventName, obj) {
    if (socketPara.sendFunc) {
      socketPara.sendFunc[socketPara.action](eventName, obj);
    }
  }

  static broadcastAll(room, eventName, obj) {
    if (socketList['render']) {
      socketList['render'].emit(room, { key: eventName, value: obj });
    }
    if (socketList['web']) {
      socketList['web'].sockets.in(room).emit(eventName, obj);
    }
  }

  static broadcast(socketName, room, eventName, obj) {
    if (socketList[socketName]) {
      if (socketName === 'render') {
        socketList['render'].emit(room, { key: eventName, value: obj });
      } else {
        socketList['web'].sockets.in(room).emit(eventName, obj);
      }
    }
  }

  static addSocket(name, socket) {
    socketList[name] = socket;
  }

  static removeSocket(name) {
    delete socketList[name];
  }
}

export default SocketMgr;
