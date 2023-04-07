import { Component, For } from "solid-js";
import { createForm } from "../src/index";

const App: Component = () => {
    const form = createForm(
        {
            color: { initialValue: "" },
            radio: { initialValue: "test2", isRadio: true },
        },
        (values) => console.log(values)
    );

    return (
        <form
            style={{ display: "flex", "flex-direction": "column", width: "200px" }}
            onSubmit={form.submit}
        >
            <p>Checkbox</p>
            <input type="checkbox" />
            <p>Color</p>
            <input type="color" {...form.fields.color} />
            <p>Date</p>
            <input type="date" />
            <p>Datetime</p>
            <input type="datetime-local" />
            <p>Email</p>
            <input type="email" />
            <input type="file" />
            {/* <For each={form.fields.files}>
                {(file, i) => (
                    <p>
                        {i()}.{file.name}
                        <button>X</button>
                    </p>
                )}
            </For> */}
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
