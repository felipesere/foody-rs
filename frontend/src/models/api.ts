import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
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

export function useUser(token: string) {
  return useQuery({
    queryKey: ["user", "profile", token],
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
  });
}

export function useLogin(params: { redirectTo: string | undefined }) {
  const client = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ["user", "token"],
    mutationFn: async (params: LoginParms) => {
      console.log("Doing a login...");
      deleteToken();
      const response = await fetch("http://localhost:3000/api/auth/login", {
        body: JSON.stringify(params),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Login failed");
      }
      const body = await response.json();
      return LoginResponseSchema.parse(body);
    },
    onSuccess: (value: LoginResponse, _) => {
      void client.invalidateQueries({ queryKey: ["user", "profile"] });
      saveToken(value.token);
      client.setQueryData(["user", "token"], value.token);
      navigate({ to: params.redirectTo || "/", search: {}, replace: true });
    },
    onError: (error, _variables) => {
      console.log(`Failed to do the login: ${error}`);
    },
  });
}

export function useLogout(): () => Promise<void> {
  const navigate = useNavigate();
  console.log("preparing logout");
  const queryClient = useQueryClient();
  return async () => {
    console.log("logging out...");
    deleteToken();
    await queryClient.setQueryData(["user", "token"], false);
    await queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    await navigate({ to: "/", replace: true });
  };
}

// consider if we want to add a timestamp into this to
// prevent storing it forever
function saveToken(token: string) {
  window.localStorage.setItem("__user_token", token);
}

function deleteToken() {
  window.localStorage.removeItem("__user_token");
}
export function loadToken() {
  return window.localStorage.getItem("__user_token");
}
