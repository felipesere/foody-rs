import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

type LoginParms = { email: string; password: string };

const LoginResponseSchema = z.object({
  token: z.string(),
  pid: z.string(),
  name: z.string(),
  is_verified: z.boolean(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

const UserProfileSchema = z.object({
  email: z.string(),
  name: z.string(),
  pid: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export function useUser() {
  const client = useQueryClient();
  const token = client.getQueryData(["user", "token"]);
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: async () => {
      console.log(`making a request with token: ${token}`);
      const response = await fetch("http://localhost:3000/api/user/current", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const body = await response.json();
      return UserProfileSchema.parse(body);
    },
    enabled: !!token,
  });
}

export function useLogin() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (params: LoginParms) => {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        body: JSON.stringify(params),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const body = await response.json();
      return LoginResponseSchema.parse(body);
    },
    onSuccess: (value: LoginResponse, _) => {
      client.setQueryData(["user", "token"], () => value.token);
      client.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}
