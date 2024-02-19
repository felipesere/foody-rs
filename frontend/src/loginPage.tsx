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
        onSubmit: async ({value}) => login.mutate(value),
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
                        children={(emailFiled) =>
                            <div className={"form_group"}>
                                <label htmlFor={emailFiled.name}>Username</label>
                                <div className={"hint"}></div>
                                <input type={"text"}
                                       name={emailFiled.name}
                                       id={emailFiled.name}
                                       value={emailFiled.state.value}
                                       onBlur={emailFiled.handleBlur}
                                       onChange={(e) => emailFiled.handleChange(e.target.value)}
                                       className={""}
                                />
                                {emailFiled.state.meta.errorMap["onBlur"] ? (<em>{emailFiled.state.meta.errorMap["onBlur"]}</em>) : null}
                            </div>}
                    />
                    <form.Field
                        name="password"
                        children={(password_field) =>
                            <div className={"form_group"}>
                                <label htmlFor={password_field.name}> Password</label>
                                <div className={"hint"}></div>
                                <input type={"password"}
                                       name={password_field.name}
                                       id={password_field.name}
                                       value={password_field.state.value}
                                       onChange={(e) => password_field.handleChange(e.target.value)}
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