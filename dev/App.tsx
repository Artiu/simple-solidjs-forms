import { Component, For } from "solid-js";
import { createForm } from "../src/index";

const App: Component = () => {
    const form = createForm({
        initialFields: { color: "", date: "", files: [] as File[] },
        validations: { color: [], date: [], files: [] },
        fetchFunction: (data) => {
            console.log(data);
        },
    });

    return (
        <form
            style={{ display: "flex", "flex-direction": "column", width: "200px" }}
            onSubmit={form.submit}
        >
            <p>Checkbox</p>
            <input type="checkbox" />
            <p>Color</p>
            <input type="color" {...form.getField("color")} />
            <p>Date</p>
            <input type="date" {...form.getField("date")} />
            <p>Datetime</p>
            <input type="datetime-local" />
            <p>Email</p>
            <input type="email" />
            <input type="file" {...form.getField("files")} />
            <For each={form.fields.files}>
                {(file, i) => (
                    <p>
                        {i()}.{file.name}
                        <button onClick={form.removeFileHandler("files", file)}>X</button>
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
            <input type="radio" />
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
