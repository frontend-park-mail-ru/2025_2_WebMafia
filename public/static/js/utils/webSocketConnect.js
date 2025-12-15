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
    this.socket = new WebSocket(`${this.url}?csrf_token=${this.token}`);

    this.socket.onopen = () => {
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
