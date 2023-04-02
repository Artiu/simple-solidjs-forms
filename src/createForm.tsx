import { batch, createSignal } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";

type ValueType = string | boolean | number | File[];

type Validation<T> = {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (fields: T) => boolean;
    error: string;
};

type Validations<T> = {
    [key in keyof T]: Validation<T>[];
};

type Fields = {
    [key: string]: ValueType;
};

type Errors<T> = { [key in keyof T]: string };

type FetchFunc<T> = (
    data: T,
    additional: { setErrors: SetStoreFunction<Errors<T>>; clearForm: () => void }
) => void;

type CreateFormProps<T extends Fields> = {
    initialFields: T;
    validations: Validations<T>;
    fetchFunction: FetchFunc<T>;
};

export function createForm<T extends Fields>(props: CreateFormProps<T>) {
    const [fields, setFields] = createStore({ ...props.initialFields });
    const [errors, setErrors] = createStore(
        Object.keys(props.initialFields).reduce(
            (prev, current) => ({ ...prev, [current]: "" }),
            {}
        ) as Errors<T>
    );
    const [wasSubmitted, setWasSubmitted] = createSignal(false);

    const clear = () => {
        setFields(props.initialFields);
        batch(() => {
            Object.entries(errors).forEach(([key]) => {
                setErrors({ ...errors, [key]: "" });
            });
        });
        setWasSubmitted(false);
    };

    const updateField = (name: keyof T) => (e: Event) => {
        const input = e.currentTarget as HTMLInputElement;
        if (typeof fields[name] === "boolean") {
            setFields({ ...fields, [name]: input.checked });
        } else if (Array.isArray(fields[name])) {
            if (!input.files) return;
            setFields({
                ...fields,
                [name]: [...(fields[name] as File[]), ...input.files],
            });
        } else {
            setFields({ ...fields, [name]: input.value });
        }
        if (!wasSubmitted()) return;
        validateFields();
    };

    const getField = (
        name: keyof T
    ):
        | { checked: boolean; onChange: (e: Event) => void }
        | { value: string | number; onInput: (e: Event) => void }
        | { onChange: (e: Event) => void } => {
        const value = fields[name];
        if (typeof value === "boolean") {
            return { checked: value, onChange: updateField(name) };
        }
        if (Array.isArray(value)) {
            return { onChange: updateField(name) };
        }
        return { value, onInput: updateField(name) };
    };

    const removeFileHandler = (name: keyof T, file: File) => () => {
        setFields({ ...fields, [name]: (fields[name] as File[]).filter((f) => f !== file) });
    };

    const validateFields = () => {
        for (const [key, validations] of Object.entries(props.validations)) {
            const fieldValue = fields[key as keyof T];
            let isCorrect = true;
            for (const validation of validations) {
                const setError = () => {
                    setErrors({ ...errors, [key as keyof T]: validation.error });
                    isCorrect = false;
                };

                if (validation.required && !fieldValue) {
                    setError();
                    break;
                }

                if (validation.min !== undefined && validation.min > (fieldValue as number)) {
                    setError();
                    break;
                }

                if (validation.max !== undefined && validation.max < (fieldValue as number)) {
                    setError();
                    break;
                }

                if (
                    validation.minLength !== undefined &&
                    validation.minLength > fieldValue.toString().length
                ) {
                    setError();
                    break;
                }

                if (
                    validation.maxLength !== undefined &&
                    validation.maxLength < fieldValue.toString().length
                ) {
                    setError();
                    break;
                }

                if (
                    validation.pattern !== undefined &&
                    !validation.pattern.test(fieldValue.toString())
                ) {
                    setError();
                    break;
                }

                if (validation.custom !== undefined && !validation.custom(fields)) {
                    setError();
                    break;
                }
            }
            if (!isCorrect) break;
            setErrors({ ...errors, [key]: "" });
        }
    };

    const submit = (e?: Event) => {
        e?.preventDefault();
        validateFields();
        setWasSubmitted(true);
        if (Object.values(errors).some((val) => val !== "")) return;
        props.fetchFunction(fields, { setErrors, clearForm: clear });
    };

    return { fields, errors, getField, removeFileHandler, submit };
}
