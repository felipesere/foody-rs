import {useForm} from "@tanstack/react-form";
import {zodValidator} from '@tanstack/zod-form-adapter'
import {z} from 'zod'
import {useLogin} from "./models/api.ts";

export function LoginPage() {
    let login = useLogin();

    const form = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
        onSubmit: async ({value}) => {
            let v = await login.mutateAsync(value);
            console.log(v)

        },
        validatorAdapter: zodValidator
    })

    return (
        <div className="content-grid">
            <h3>Login</h3>
            <form.Provider>
                <form className={"stack"} onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void form.handleSubmit();
                }}>
                    <form.Field
                        name="email"
                        validators={{
                            onBlur: z.string().email()
                        }}
                        children={(emailField) =>
                            <div className={"form_group"}>
                                <label htmlFor={emailField.name}>Username</label>
                                <div className={"hint"}></div>
                                <input type={"text"}
                                       autoComplete={"username"}
                                       name={emailField.name}
                                       id={emailField.name}
                                       value={emailField.state.value}
                                       onBlur={emailField.handleBlur}
                                       onChange={(e) => emailField.handleChange(e.target.value)}
                                       className={""}
                                />
                                {emailField.state.meta.errorMap["onBlur"] ? (
                                    <em>{emailField.state.meta.errorMap["onBlur"]}</em>) : null}
                            </div>}
                    />
                    <form.Field
                        name="password"
                        children={(passwordField) =>
                            <div className={"form_group"}>
                                <label htmlFor={passwordField.name}> Password</label>
                                <div className={"hint"}></div>
                                <input type={"password"}
                                       autoComplete={"current-password"}
                                       name={passwordField.name}
                                       id={passwordField.name}
                                       value={passwordField.state.value}
                                       onChange={(e) => passwordField.handleChange(e.target.value)}
                                       className={""}/>
                            </div>}
                    />
                    <form.Subscribe
                        selector={(state) => [state.canSubmit]}
                        children={([canSubmit]) => (
                            <button type={"submit"} id={"submit"} disabled={!canSubmit}> Sign In</button>
                        )}/>
                </form>
            </form.Provider>
        </div>
    )
}