<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Simple%20Forms&background=tiles&project=%20" alt="{{name_of_lib}}">
</p>

# Simple SolidJS Forms

Simple SolidJS Forms is utility library for easier form creation in SolidJS.

## Quick start

Install it:

```bash
npm i simple-solidjs-forms
# or
yarn add simple-solidjs-forms
# or
pnpm add simple-solidjs-forms
```

Use it:

```tsx
import { createForm } from "simple-solidjs-forms";

const App = () => {
    const form = createForm(
        {
            username: {
                initialValue: "",
                validations: [
                    { required: true, error: "Username is required!" },
                    { minLength: 5, error: "Username is too short!" },
                    { maxLength: 30, error: "Username too long!" },
                ],
            },
            age: {
                initialValue: "",
                isRadio: true,
                validations: { required: true, error: "Age is required" },
            },
            password: {
                initialValue: "",
                validations: [
                    { required: true, error: "Password is required!" },
                    {
                        pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                        error: "Password doesn't meet requirements!",
                    },
                ],
            },
            confirmPassword: {
                initialValue: "",
                validations: {
                    custom: (fields) => fields.password === fields.confirmPassword,
                    error: "Passwords are not the same!",
                },
            },
        },
        async (fields, additional) => {
            //Fetch here
            const res = await fetch("/api/register", { body: JSON.stringify(fields) });
            //Set errors if response is not ok
            if (!res.ok) {
                additional.setErrors({ username: "This username is unavailable!" });
                return;
            }
            //Reset form when you want to
            additional.resetForm();
        }
    );

    return (
        <form onSubmit={form.submit}>
            <input type="text" placeholder="Username" {...form.fields.username()} />
            <span>{form.errors.username}</span>
            <span>Age </span>
            <span>Less than 18</span>
            <input {...form.fields.age("18-")} />
            <span>18+</span>
            <input {...form.fields.age("18+")} />
            <span>{form.errors.age}</span>
            <input type="password" placeholder="Password" {...form.fields.password()} />
            <span>{form.errors.password}</span>
            <input
                type="password"
                placeholder="Confirm password"
                {...form.fields.confirmPassword()}
            />
            <span>{form.errors.confirmPassword}</span>
            <button type="submit">Send</button>
        </form>
    );
};
```

Checkout another example in dev folder on Github.
