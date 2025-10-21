// Global type declarations for Azion Edge Functions runtime

declare global {
  namespace Azion {
    namespace env {
      function get(key: string): string | undefined;
    }
  }
}

export {};
