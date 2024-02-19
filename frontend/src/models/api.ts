import {useMutation} from "@tanstack/react-query";
import ky from "ky"

export function useLogin() {
    return useMutation({
        mutationFn: (params: { email: string, password: string }) => {
            return ky.post("http://localhost:3000/api/auth/login", {
                json: {
                    email: params.email,
                    password: params.password
                }
            }).then((x) => {
                console.log(x);
                return x
            })
        }
    })
}