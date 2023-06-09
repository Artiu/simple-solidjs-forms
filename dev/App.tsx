import { Component, For } from "solid-js";
import { createForm } from "../src/index";

const App: Component = () => {
    const form = createForm(
        {
            checkbox: {
                initialValue: true,
                validations: { required: true, error: "Checkbox is required" },
            },
            color: {
                initialValue: "",
                validations: [{ required: true, error: "color is required" }],
            },
            date: { initialValue: "2022-09-07" },
            datetimelocal: { initialValue: "" },
            email: {
                initialValue: "",
                validations: [
                    { required: true, error: "Email is required" },
                    { minLength: 3, error: "Email too short" },
                ],
            },
            file: {
                initialValue: [],
                validations: [
                    { required: true, error: "File is required!" },
                    { maxFileSize: 176810, error: "File too large!" },
                ],
            },
            month: { initialValue: "" },
            number: {
                initialValue: 6,
                validations: { min: 0, max: 100, error: "Number out of range" },
            },
            radio: { initialValue: "test2", isRadio: true },
            range: { initialValue: 45 },
            search: { initialValue: "" },
            tel: { initialValue: "" },
            time: { initialValue: "" },
            url: { initialValue: "" },
            week: { initialValue: "" },
        },
        (values, additional) => {
            console.log(values);
        }
    );

    const changeEmailValue = () => {
        form.updateValue("email", "It works");
    };

    return (
        <form
            style={{ display: "flex", "flex-direction": "column", width: "200px" }}
            onSubmit={form.submit}
            novalidate
        >
            <p>Checkbox</p>
            <input type="checkbox" {...form.fields.checkbox()} />
            <p>Color</p>
            <input type="color" {...form.fields.color()} />
            <p>Date</p>
            <input type="date" {...form.fields.date()} />
            <p>Datetime</p>
            <input type="datetime-local" {...form.fields.datetimelocal()} />
            <p>Email</p>
            <input type="email" {...form.fields.email()} />
            <input type="file" onChange={form.fields.file.onChange} />
            <For each={form.values.file}>
                {(file, i) => (
                    <p>
                        {i()}.{file.name}
                        <button onClick={() => form.fields.file.removeHandler(file)}>X</button>
                    </p>
                )}
            </For>
            <p>Month</p>
            <input type="month" {...form.fields.month()} />
            <p>Number</p>
            <input type="number" {...form.fields.number()} />
            <p>Radio</p>
            <input {...form.fields.radio("test1")} />
            <input {...form.fields.radio("test2")} />
            <p>Range</p>
            <input type="range" {...form.fields.range()} />
            <p>Search</p>
            <input type="search" {...form.fields.search()} />
            <p>Tel</p>
            <input type="tel" {...form.fields.tel()} />
            <p>Time</p>
            <input type="time" {...form.fields.time()} />
            <p>Url</p>
            <input type="url" {...form.fields.url()} />
            <p>Week</p>
            <input type="week" {...form.fields.week()} />
            {JSON.stringify(form.errors)}
            <button type="button" onClick={changeEmailValue}>
                Set email to "It works"
            </button>
            <button type="button" onClick={form.reset}>
                Reset
            </button>
            <button type="submit">Submit</button>
        </form>
    );
};

export default App;
