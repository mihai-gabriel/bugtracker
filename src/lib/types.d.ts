import type { SessionUser } from "$lib/interfaces/dto/user";

declare module "@auth/core/types" {
  interface Session {
    user: SessionUser;
  }
}
