export interface CustomEvent {
  request: Request;
  args?: any;
}

export interface EdgeFunctionResponse {
  status?: number;
  headers?: Record<string, string>;
  body?: string | ReadableStream | ArrayBuffer;
}
