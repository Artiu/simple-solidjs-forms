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

type Fields = {
    [key: string]: ValueType;
};

type Errors<T> = { [key in keyof T]: string };

type FetchFunc<T> = (
    data: T,
    additional: { setErrors: SetStoreFunction<Errors<T>>; clearForm: () => void }
) => void;

type InitialField<T, K> = {
    isRadio?: boolean;
    initialValue: T;
    validations?: Validation<K>[] | Validation<K>;
};

type InitialFields<T extends Fields> = {
    [key in keyof T]: InitialField<T[key], T>;
};

export function createForm<T extends Fields>(
    initialFields: InitialFields<T>,
    fetchFunc?: FetchFunc<T>
) {
    const resetValues = () => {
        return Object.entries(initialFields).reduce(
            (prev, [key, value]) => ({ ...prev, [key]: value.initialValue }),
            {}
        ) as T;
    };

    const [values, setValues] = createStore(resetValues());
    const [errors, setErrors] = createStore(
        Object.keys(initialFields).reduce(
            (prev, current) => ({ ...prev, [current]: "" }),
            {}
        ) as Errors<T>
    );
    const [wasSubmitted, setWasSubmitted] = createSignal(false);

    const clear = () => {
        setValues(resetValues());
        batch(() => {
            Object.entries(errors).forEach(([key]) => {
                setErrors({ ...errors, [key]: "" });
            });
        });
        setWasSubmitted(false);
    };

    const updateField = (name: keyof T) => (e: Event) => {
        const input = e.currentTarget as HTMLInputElement;
        if (typeof values[name] === "boolean") {
            setValues({ ...values, [name]: input.checked });
        } else if (Array.isArray(values[name])) {
            if (!input.files) return;
            setValues({
                ...values,
                [name]: [...(values[name] as File[]), ...input.files],
            });
        } else {
            setValues({ ...values, [name]: input.value });
        }
        if (!wasSubmitted()) return;
        validateFields();
    };

    type Field = TextInput | CheckboxInput | FileInput | RadioInput;

    type TextInput = {
        value: string | number;
        onInput: (e: Event) => void;
    };
    type CheckboxInput = { checked: boolean; onChange: (e: Event) => void };
    type FileInput = { onChange: (e: Event) => void; removeHandler: (file: File) => void };
    type RadioInput = (value: string) => {
        type: "radio";
        value: string;
        name: string;
        checked: boolean;
        onChange: (e: Event) => void;
    };

    const getField = (name: keyof T): Field => {
        const currentValue = values[name];
        if (typeof currentValue === "boolean") {
            return { checked: currentValue, onChange: updateField(name) };
        }
        if (Array.isArray(currentValue)) {
            return {
                onChange: updateField(name),
                removeHandler: (file: File) =>
                    setValues({
                        ...values,
                        [name]: (values[name] as File[]).filter((f) => f !== file),
                    }),
            };
        }
        // const func = (value: string) => ({
        //     type: "radio",
        //     value,
        //     checked: value === currentValue,
        //     name: name as string,
        //     onChange: (e: Event) => {
        //         const input = e.currentTarget as HTMLInputElement;
        //         if (input.checked) {
        //             setValues({ ...values, [name]: input.value });
        //         }
        //     },
        // });

        return {
            value: currentValue,
            onInput: updateField(name),
        };
    };

    const fields = Object.keys(initialFields).reduce(
        (prev, currentKey) => ({ ...prev, [currentKey]: getField(currentKey) }),
        {}
    ) as { [key in keyof T]: Field };

    const validateFields = () => {
        for (const [key, field] of Object.entries(initialFields)) {
            const fieldValue = values[key as keyof T];
            let isCorrect = true;
            if (!field.validations) return;
            if (Array.isArray(field.validations)) {
                for (const validation of field.validations) {
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

                    if (validation.custom !== undefined && !validation.custom(values)) {
                        setError();
                        break;
                    }
                }
                if (!isCorrect) break;
                setErrors({ ...errors, [key]: "" });
            } else {
                const validation = field.validations;
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

                if (validation.custom !== undefined && !validation.custom(values)) {
                    setError();
                    break;
                }
            }
        }
    };

    const submit = (e?: Event) => {
        e?.preventDefault();
        validateFields();
        setWasSubmitted(true);
        if (Object.values(errors).some((val) => val !== "")) return;
        if (!fetchFunc) return;
        fetchFunc(values, { setErrors, clearForm: clear });
    };

    return { fields, values, errors, setValues, submit };
}
