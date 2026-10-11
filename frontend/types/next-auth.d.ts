import { User } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: User & {
      token?: string;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    token?: string;
    role?: string;
  }
}
