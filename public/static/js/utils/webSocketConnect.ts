import { Comment, WebSocketHandlers } from '@/models.ts';

export class CommentsSocket<T = Comment> {
  private url: string;
  private token: string;
  private socket: WebSocket | null = null;
  private handlers: WebSocketHandlers<T>;

  constructor(url: string, token: string, handlers: WebSocketHandlers<T>) {
    this.url = url;
    this.token = token;
    this.handlers = handlers;
  }

  public connect(): void {
    if (!this.url) {
      console.error('WS Error: URL is missing');
      return;
    }

    if (this.socket) {
      this.disconnect();
    }

    try {
      this.socket = new WebSocket(`${this.url}?csrf_token=${this.token}`);

      this.setupListeners();
    } catch (e) {
      console.error('WS Connection Failed:', e);
    }
  }

  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      this.handlers.onOpen?.();
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as T;
        this.handlers.onMessage(data);
      } catch (e) {
        console.error('WS Parse Error', e);
      }
    };

    this.socket.onerror = (event: Event) => {
      console.error('WS Error', event);
      this.handlers.onError?.(event);
    };

    this.socket.onclose = (event: CloseEvent) => {
      this.handlers.onClose?.(event.code);
    };
  }

  public send(data: unknown): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('WS is not open. Cannot send message.');
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;

      this.socket.close();
      this.socket = null;
    }
  }
}
