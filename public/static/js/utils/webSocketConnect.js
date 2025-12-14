export class CommentsSocket {
  constructor(url, token, { onMessage, onOpen, onClose, onError } = {}) {
    this.url = url;
    this.token = token;
    this.socket = null;
    this.handlers = { onMessage, onOpen, onClose, onError };
  }

  connect() {
    if (!this.url) {
      console.error('WS Error: URL is missing');
      return;
    }

    if (!this.token) {
      console.warn('WS Warning: csrf-token is empty');
    }

    // 👇 ВАЖНО: Sec-WebSocket-Protocol
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('WS Open');
      this.handlers.onOpen?.();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handlers.onMessage?.(data);
      } catch (e) {
        console.error('WS Parse Error', e);
      }
    };

    this.socket.onerror = (err) => {
      console.error('WS Error', err);
      this.handlers.onError?.(err);
    };

    this.socket.onclose = (event) => {
      console.log('WS Closed', event.code);
      this.handlers.onClose?.();
    };
  }

  send(data) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}
