import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { http } from "./http.ts";

type LoginParams = { email: string; password: string };

const LoginResponseSchema = z.object({
  token: z.string(),
  pid: z.string(),
  name: z.string(),
  is_verified: z.boolean(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const UserProfileSchema = z.object({
  email: z.string(),
  name: z.string(),
  pid: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export function useUser(token: string) {
  return useQuery({
    queryKey: ["user", "profile", token],
    queryFn: async () => {
      const body = await http
        .get("api/user/current", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();
      return UserProfileSchema.parse(body);
    },
  });
}

export function useLogin(params: { redirectTo: string | undefined }) {
  const client = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ["user", "token"],
    mutationFn: async (params: LoginParams) => {
      deleteToken();
      const body = await http
        .post("api/auth/login", {
          json: {
            email: params.email,
            password: params.password,
          },
        })
        .json();
      return LoginResponseSchema.parse(body);
    },
    onSuccess: async (value: LoginResponse, _) => {
      await client.invalidateQueries({ queryKey: ["user", "profile"] });
      saveToken(value.token);
      return navigate({
        to: params.redirectTo || "/",
        search: {},
        replace: true,
      });
    },
    onError: (error, _variables) => {
      console.log(`Failed to do the login: ${error}`);
    },
  });
}

export function useLogout(): () => Promise<void> {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return async () => {
    deleteToken();
    await queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    await navigate({ to: "/", replace: true });
  };
}

// consider if we want to add a timestamp into this to
// prevent storing it forever
function saveToken(token: string) {
  const data = {
    created: new Date().toISOString(),
    token,
  };

  window.localStorage.setItem("__user_token", JSON.stringify(data));
}

function deleteToken() {
  window.localStorage.removeItem("__user_token");
}

const tokenDataSchema = z.object({
  created: z.coerce.date(),
  token: z.string(),
});
const DAYS = 24 * 60 * 60 * 1000; /* ms */

export function loadToken() {
  const data = window.localStorage.getItem("__user_token");
  if (!data) {
    return undefined;
  }
  let jsonData: unknown;
  try {
    jsonData = JSON.parse(data);
  } catch (e) {
    console.log(`Failed to parse token as JSON: ${e}`);
    deleteToken();
    return undefined;
  }

  const actualData = tokenDataSchema.safeParse(jsonData);
  if (actualData.success) {
    const { created, token } = actualData.data;

    const now = new Date().getTime();
    if (now - created.getTime() > 2 * DAYS) {
      console.log("Token is old, removing");
      deleteToken();
      return undefined;
    }
    return token;
  }
  console.log(actualData.error);
  deleteToken();
  return undefined;
}
