import { Component, For } from "solid-js";
import { createForm } from "../src/index";

type Form = {
    checkbox: boolean;
    color: string;
    date: string;
    datetimelocal: string;
    email: string;
    file: File[];
    month: string;
    number: number;
    radio: string;
    range: number;
    search: string;
    tel: string;
    time: string;
    url: string;
    week: string;
};

const App: Component = () => {
    const form = createForm<Form>(
        {
            checkbox: { initialValue: true },
            color: { initialValue: "" },
            date: { initialValue: "12-09-2022" },
            datetimelocal: { initialValue: "" },
            email: { initialValue: "" },
            file: { initialValue: [] },
            month: { initialValue: "" },
            number: { initialValue: 6, validations: { error: "" } },
            radio: { initialValue: "test2", isRadio: true },
            range: { initialValue: 0 },
            search: { initialValue: "" },
            tel: { initialValue: "" },
            time: { initialValue: "" },
            url: { initialValue: "" },
            week: { initialValue: "" },
        },
        (values) => console.log(values)
    );

    return (
        <form
            style={{ display: "flex", "flex-direction": "column", width: "200px" }}
            onSubmit={form.submit}
        >
            <p>Checkbox</p>
            <input type="checkbox" {...form.fields.checkbox} />
            <p>Color</p>
            <input type="color" {...form.fields.color} />
            <p>Date</p>
            <input type="date" {...form.fields.date} />
            <p>Datetime</p>
            <input type="datetime-local" {...form.fields.datetimelocal} />
            <p>Email</p>
            <input type="email" {...form.fields.email} />
            <input type="file" {...form.fields.file} />
            <For each={form.values.file}>
                {(file, i) => (
                    <p>
                        {i()}.{file.name}
                        <button>X</button>
                    </p>
                )}
            </For>
            <p>Month</p>
            <input type="month" />
            <p>Number</p>
            <input type="number" />
            <p>Password</p>
            <input type="password" />
            <p>Radio</p>
            <input {...form.fields.radio("elobenc2")} />
            <input {...form.fields.radio("elobenc")} />
            <p>Range</p>
            <input type="range" />
            <p>Search</p>
            <input type="search" />
            <p>Tel</p>
            <input type="tel" />
            <p>Text</p>
            <input type="text" />
            <p>Time</p>
            <input type="time" />
            <p>Url</p>
            <input type="url" />
            <p>Week</p>
            <input type="week" />
            <button type="submit">Submit</button>
        </form>
    );
};

export default App;
