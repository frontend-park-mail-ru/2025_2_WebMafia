export class CommentsSocket {
  constructor(trackId, { onMessage, onOpen, onClose, onError }) {
    this.trackId = trackId;
    this.socket = null;

    this.onMessage = onMessage;
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.onError = onError;
  }

  connect() {
    const WS_URL = `ws://localhost:8000/ws/comments?track_id=${this.trackId}`;

    this.socket = new WebSocket(WS_URL);
    this.socket.onopen = () => {
      console.log('open');
      this.onOpen?.();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('message');
        this.onMessage?.(data);
      } catch {
        console.log('Message was invalid', event.data);
      }
    };

    this.socket.onerror = (err) => {
      console.log('error');
      this.onError?.(err);
    };

    this.socket.onclose = () => {
      console.log('close');
      this.onClose?.();
    };
  }

  send(data) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  disconnect() {
    this.socket?.();
  }
}
