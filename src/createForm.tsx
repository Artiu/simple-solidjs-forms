import { createSignal, Setter } from "solid-js";
import { createStore } from "solid-js/store";

type ValueType = string | boolean | number;

type Validations<T> = {
    func: (fields: T) => boolean;
    error: string;
}[];

type Fields = {
    [key: string]: ValueType;
};

type FetchFunc<T> = (data: T, setError: Setter<string>) => Promise<void>;

type CreateFormProps<T extends Fields> = {
    initialFields: T;
    validations: Validations<T>;
    fetchFunction: FetchFunc<T>;
};

export function createForm<T extends Fields>(props: CreateFormProps<T>) {
    const [fields, setFields] = createStore(props.initialFields);
    const [error, setError] = createSignal("");

    const updateField = (name: keyof T) => (e: Event) => {
        const input = e.currentTarget as HTMLInputElement;
        type ChangeType = Pick<typeof fields, keyof typeof fields>;
        if (typeof fields[name] === "boolean") {
            setFields({ [name]: input.checked } as ChangeType);
        } else {
            setFields({ [name]: input.value } as ChangeType);
        }
        validateFields();
    };

    const getField = (
        name: keyof T
    ):
        | { checked: boolean; onChange: (e: Event) => void }
        | { value: string | number; onInput: (e: Event) => void } => {
        const value = fields[name];
        if (typeof value === "boolean") {
            return { checked: value, onChange: updateField(name) };
        }
        return { value, onInput: updateField(name) };
    };

    const validateFields = () => {
        for (const validation of props.validations) {
            if (!validation.func(fields)) {
                setError(validation.error);
                return;
            }
        }
        setError("");
    };

    const submitForm = (e?: Event) => {
        e?.preventDefault();
        validateFields();
        if (error()) return;
        props.fetchFunction(fields, setError);
    };

    return { fields, error, getField, submitForm };
}
