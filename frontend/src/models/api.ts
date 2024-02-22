import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

type LoginParms = { email: string; password: string };

const LoginResponseSchema = z.object({
  token: z.string(),
  pid: z.string(),
  name: z.string(),
  is_verified: z.boolean(),
});

export function useLogin() {
  return useMutation({
    mutationFn: async (params: LoginParms) => {
      let response = await fetch("http://localhost:3000/api/auth/login", {
        body: JSON.stringify(params),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      let body = await response.json();
      return LoginResponseSchema.parse(body);
    },
  });
}
