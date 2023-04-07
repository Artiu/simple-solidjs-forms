import { batch, createSignal } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";

type ValueType = string | boolean | number | File[];

type Validation<T> = {
    required?: boolean;
    min?: number;
    max?: number;
    maxFileSize?: number;
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
    additional: { setErrors: SetStoreFunction<Errors<T>>; resetForm: () => void }
) => void;

type InitialField<T, K> = {
    isRadio?: boolean;
    initialValue: T;
    validations?: Validation<K>[] | Validation<K>;
};

type InitialFields<T extends Fields> = {
    [key in keyof T]: InitialField<T[key], T>;
};

export function createForm<T extends Fields, K extends InitialFields<T> = InitialFields<T>>(
    initialFields: K,
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

    const reset = () => {
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

    type Input = TextInput | CheckboxInput | FileInput;

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

    const getField = (name: keyof T) => {
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
        if (initialFields[name].isRadio) {
            return (value: string) => ({
                type: "radio",
                value,
                checked: value === currentValue,
                name,
                onChange: (e: Event) => {
                    const input = e.currentTarget as HTMLInputElement;
                    if (input.checked) {
                        setValues({ ...values, [name]: input.value });
                    }
                },
            });
        }
        return {
            value: currentValue,
            onInput: updateField(name),
        };
    };

    const fields = Object.keys(initialFields).reduce(
        (prev, currentKey) => ({ ...prev, [currentKey]: getField(currentKey) }),
        {}
    ) as { [key in keyof K]: K[key]["isRadio"] extends true ? RadioInput : Input };

    const validateField = (fieldValue: ValueType, validation: Validation<T>) => {
        const REQUIRED_VALIDATION =
            validation.required &&
            (Array.isArray(fieldValue) ? fieldValue.length < 1 : !fieldValue);

        const MIN_VALIDATION =
            validation.min !== undefined && validation.min > (fieldValue as number);

        const MAX_VALIDATION =
            validation.max !== undefined && validation.max < (fieldValue as number);

        const MAXFILESIZE_VALIDATION =
            validation.maxFileSize !== undefined &&
            Array.isArray(fieldValue) &&
            fieldValue.some((file) => file.size > (validation.maxFileSize as number));

        const MINLENGTH_VALIDATION =
            validation.minLength !== undefined &&
            (Array.isArray(fieldValue)
                ? validation.minLength > fieldValue.length
                : validation.minLength > fieldValue.toString().length);

        const MAXLENGTH_VALIDATION =
            validation.maxLength !== undefined &&
            (Array.isArray(fieldValue)
                ? validation.maxLength > fieldValue.length
                : validation.maxLength > fieldValue.toString().length);

        const PATTERN_VALIDATION =
            validation.pattern !== undefined && !validation.pattern.test(fieldValue.toString());

        const CUSTOM_VALIDATION = validation.custom !== undefined && !validation.custom(values);

        const validations = [
            REQUIRED_VALIDATION,
            MIN_VALIDATION,
            MAX_VALIDATION,
            MAXFILESIZE_VALIDATION,
            MINLENGTH_VALIDATION,
            MAXLENGTH_VALIDATION,
            PATTERN_VALIDATION,
            CUSTOM_VALIDATION,
        ];

        return validations.some((val) => val);
    };

    const validateFields = () => {
        for (const [key, field] of Object.entries(initialFields)) {
            const fieldValue = values[key];
            let isCorrect = true;
            if (!field.validations) continue;
            if (Array.isArray(field.validations)) {
                for (const validation of field.validations as Validation<T>[]) {
                    if (validateField(fieldValue, validation)) {
                        setErrors({ ...errors, [key]: validation.error });
                        isCorrect = false;
                    }
                }
                if (!isCorrect) continue;
                setErrors({ ...errors, [key]: "" });
                continue;
            }
            const validation = field.validations as Validation<T>;
            if (validateField(fieldValue, validation)) {
                setErrors({ ...errors, [key]: validation.error });
                isCorrect = false;
            }
        }
    };

    const submit = (e?: Event) => {
        e?.preventDefault();
        validateFields();
        setWasSubmitted(true);
        if (Object.values(errors).some((val) => val !== "")) return;
        if (!fetchFunc) return;
        fetchFunc(values, { setErrors, resetForm: reset });
    };

    return { fields, values, errors, setValues, submit, reset };
}