/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod/v4';
type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export type FormState<
	T extends z.ZodObject<any>,
	Initial extends z.infer<T> = z.infer<T>
> = ReturnType<typeof createFormState<T, Initial>>;

/**
 * The props for `createFormState`.
 *
 * @template {z.ZodObject<any>} T The zod schema that will validate the form state.
 * @template {z.infer<T>} Initial The initial value of the form state.
 */
export type FormStateProps<T extends z.ZodObject<any>, Initial extends z.infer<T> = z.infer<T>> = {
	/**
	 * zod/v4 schema
	 * @link https://zod.dev/v4
	 */
	schema: T;
	/**
	 * initial value of the form state, the property that is not exist in the schema is allowed but ignored
	 */
	initial?: Partial<Initial> | Partial<z.input<T>> | (() => Partial<z.input<T>> | Partial<Initial>);
	/**
	 * attributes that will be applied to the form fields, use `createAttribute` to help you create the attributes
	 */
	attribute?: FormAttribute<T>;
};
/**
 * Attributes for a form field
 */
type FormAttribute<T extends z.ZodObject<any>> = {
	[K in keyof z.infer<T>]?: ReturnType<typeof createAttribute>;
};
/**
 * The value of the form state
 */
type FormStateValue<T extends Record<string, any>> = T;
/**
 * The config of the form state
 */
type FormStateConfig<T extends z.ZodObject<any>> = {
	[K in keyof z.infer<T>]: {
		/**
		 * errors of the form field
		 */
		errors: string[];
		/**
		 * whether the form field has error
		 */
		hasError: boolean;
	};
};
/**
 * Necessary attributes for a form field
 */
type FormStateAttribute<T extends z.ZodObject<any>> = {
	[K in keyof z.infer<T>]: {
		/**
		 * whether the form field has been touched
		 */
		touched: boolean;
		/**
		 * aria-invalid attribute
		 */
		'aria-invalid': boolean;
		/**
		 * oninput event, it will validate the form field on input if the result has error
		 */
		oninput: (event: Event & { currentTarget: EventTarget & HTMLElement }) => void;
		/**
		 * onblur event, it will validate the form field on blur
		 */
		onblur: (event: Event & { currentTarget: EventTarget & HTMLElement }) => void;
	};
};
/**
 * The helper to create attributes for a form field
 * @example
 * ```svelte
 * <script lang="ts">
 * import type { HTMLInputAttributes } from 'svelte/elements';
 * import { createAttribute } from 'svelte-common-hooks';
 * const attribute = createAttribute<HTMLInputAttributes>({
 * 	type: 'text',
 * 	placeholder: 'Enter your name',
 * 	required: true,
 * 	customAttribute: 'customAttribute',
 * });
 * </script>
 * ```
 * @param attribute the attributes that will be applied to the form field
 */
export function createAttribute<InputAttribute extends Record<string, any>>(
	attribute: InputAttribute & Record<string, unknown>
) {
	return attribute;
}

/**
 * Creates and manages the state of a form based on a Zod schema.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * 	import { createFormState } from 'svelte-common-hooks';
 * 	import { z } from 'zod/v4';
 * 	const formState = createFormState({
 * 		schema: z.object({
 * 			name: z.string().min(1),
 * 			email: z.string().email(),
 * 			age: z.number().min(18)
 * 		}),
 * 		// optionally set the initial value
 * 		initial: {
 * 			name: '',
 * 			email: '',
 * 			age: 0
 * 		},
 * 		// optionally append more attribute to the form field
 * 		attribute: {
 * 			name: createAttribute<HTMLInputAttributes>({
 * 				type: 'text',
 * 				placeholder: 'Enter your name',
 * 				required: true,
 * 				customAttribute: 'customAttribute',
 * 			}),
 * 		email: createAttribute<HTMLInputAttributes>({
 * 				type: 'email',
 * 				required: true
 * 			}),
 * 		age: createAttribute<HTMLInputAttributes>({
 * 				type: 'number',
 * 				required: true
 * 			})
 * 		}
 * 	});
 * </script>
 * <form action="" method="post">
 * 	<div>
 * 		<label for="name">Name</label>
 * 		<input bind:value={formState.value.name} {...formState.attribute.name} />
 * 		{#if formState.result.name.errors.length}
 * 			{#each formState.result.name.errors as error}
 * 				<span>{error}</span>
 * 			{/each}
 * 		{/if}
 * 	</div>
 * 	<div>
 * 		<label for="email">Email</label>
 * 		<input bind:value={formState.value.email} {...formState.attribute.email} />
 * 		{#if formState.result.email.errors.length}
 * 			{#each formState.result.email.errors as error}
 * 				<span>{error}</span>
 * 			{/each}
 * 		{/if}
 * 	</div>
 * 	<div>
 * 		<label for="age">Age</label>
 * 		<input bind:value={formState.value.age} {...formState.attribute.age} />
 * 		{#if formState.result.age.errors.length}
 * 			{#each formState.result.age.errors as error}
 * 				<span>{error}</span>
 * 			{/each}
 * 		{/if}
 * 	</div>
 * </form>
 * ```
 * @template T - The Zod object schema defining the structure of the form.
 * @template Initial - The initial values of the form state, inferred from the schema.
 * @param {FormStateProps<T, Initial>} props - The configuration properties for the form state.
 * @property {FormStateValue<Initial>} value - The current values of the form fields.
 * @property {FormStateAttribute<T>} attribute - The attributes for each form field.
 * @property {FormStateConfig<T>} result - The validation result for each form field.
 * @property {Function} addErrors - Function to add errors to a specific form field.
 * @property {Function} setValue - Function to set the value of a specific form field.
 * @property {Function} validate - Function to validate a specific form field.
 * @property {Function} validateAll - Function to validate the entire form.
 */
export function createFormState<
	T extends z.ZodObject<any>,
	Initial extends z.infer<T> = z.infer<T>
>(props: FormStateProps<T, Initial>) {
	const keys = Object.keys(props.schema.shape);
	const initial = $derived<Partial<Initial> | Partial<z.input<T>> | undefined>(
		typeof props.initial === 'function' ? props.initial() : props.initial
	);

	const setInitial = () => {
		return keys.reduce((acc, value) => {
			if (initial && value in initial) {
				acc = {
					...acc,
					[value]: initial[value]
				};
			} else acc[value as NonNullable<keyof Initial>] = null!;
			return acc;
		}, {} as Initial);
	};

	$effect(() => {
		value = setInitial();
	});

	/**
	 * the reactive state of the form, the value is the initial value of the form state, if none is provided it will be null
	 */
	// eslint-disable-next-line svelte/prefer-writable-derived
	let value = $state<FormStateValue<Initial>>({ ...setInitial() });

	/**
	 * The validation result for each form field, the value is an object that contains the errors and hasError for each form field
	 */
	const result = $state<Prettify<FormStateConfig<T>>>(
		keys.reduce((acc, value) => {
			acc[value as keyof z.infer<T>] = {
				errors: [],
				hasError: false
			};
			return acc;
		}, {} as FormStateConfig<T>)
	);

	/**
	 * The attributes for each form field, the value is an object that contains the attributes for each form field
	 */
	const attribute = $state<Prettify<FormStateAttribute<T>>>(
		keys.reduce((acc, v) => {
			const userDefinedOnInput = props.attribute?.[v]?.oninput;
			const userDefinedOnBlur = props.attribute?.[v]?.onblur;
			if (props.attribute?.[v]) {
				delete props.attribute[v].name;
				delete props.attribute[v].id;
				delete props.attribute[v]['aria-invalid'];
				delete props.attribute[v].oninput;
				delete props.attribute[v].onblur;
			}
			acc[v as keyof z.infer<T>] = {
				...(props.attribute?.[v as keyof z.infer<T>] ?? {}),
				name: v,
				id: v,
				'aria-invalid': false,
				touched: false,
				oninput: (event) => {
					attribute[v].touched = true;
					if (result?.[v]?.hasError === false) return userDefinedOnInput?.(event);

					const value = 'value' in event.currentTarget ? event.currentTarget.value : undefined;
					const validated = props.schema.pick({ [v]: true }).safeParse({ [v]: value });
					if (!validated.success) {
						result[v].errors = validated.error.issues.map((v) => v.message);
						result[v].hasError = true;
						attribute[v]['aria-invalid'] = true;
					} else {
						result[v].errors = [];
						result[v].hasError = false;
						attribute[v]['aria-invalid'] = false;
					}

					userDefinedOnInput?.(event);
				},
				onblur: (event) => {
					attribute[v].touched = true;
					const value = 'value' in event.currentTarget ? event.currentTarget.value : undefined;
					const validated = props.schema.pick({ [v]: true }).safeParse({ [v]: value });
					if (!validated.success) {
						result[v].errors = validated.error.issues.map((v) => v.message);
						result[v].hasError = true;
						attribute[v]['aria-invalid'] = true;
					} else {
						result[v].errors = [];
						result[v].hasError = false;
						attribute[v]['aria-invalid'] = false;
					}
					userDefinedOnBlur?.(event);
				}
			};
			return acc;
		}, {} as FormStateAttribute<T>)
	);

	let customError = $state<Record<string, string[]>>({});

	const settleErrors = (errs: Record<string, string[] | undefined>) => {
		Object.entries(errs).forEach(([key, value]) => {
			if (key in result) {
				addErrors(key as keyof z.infer<T>, value!);
			} else {
				customError[key] = value!;
			}
		});
	};

	/**
	 * Add errors to a specific form field.
	 *
	 * @param {keyof z.infer<T>} key - The key of the form field to add errors to.
	 * @param {string[]} errors - The errors to add.
	 */
	const addErrors = (key: keyof z.infer<T>, errors: string[]) => {
		if (errors.length) {
			result[key].errors = errors;
			result[key].hasError = true;
			attribute[key]['aria-invalid'] = true;
		} else {
			result[key].errors = [];
			result[key].hasError = false;
			attribute[key]['aria-invalid'] = false;
		}
	};
	/**
	 * Set the value of a specific form field.
	 *
	 * @param {K} key - The key of the form field to set the value of.
	 * @param {typeof value[K]} newValue - The new value to set.
	 * @param {Object} [config] - The configuration object.
	 * @param {boolean} [config.validateFirst=true] - Whether to validate the field before setting the value.
	 * @param {boolean} [config.addErrorIfInvalid=true] - Whether to add errors if the field is invalid.
	 */
	const setValue = <K extends keyof typeof value>(
		key: K,
		newValue: (typeof value)[K],
		config: { validateFirst?: boolean; addErrorIfInvalid: boolean } = {
			validateFirst: true,
			addErrorIfInvalid: true
		}
	) => {
		if (!config.validateFirst) return (value[key] = newValue);
		if (!(key in keys)) return;
		const validated = props.schema.pick({ [key as string]: true }).safeParse({ [key]: newValue });
		if (validated.success) value[key] = newValue;
		if (config.addErrorIfInvalid) {
			addErrors(
				key as keyof z.infer<T>,
				validated.success ? [] : validated.error.issues.map((v) => v.message)
			);
		}
	};
	/**
	 * Validate a specific form field.
	 */
	const validate = (key: keyof z.infer<T>) => {
		const parseResult = props.schema
			.pick({ [key as string]: true })
			.safeParse({ [key]: value[key] });
		if (!parseResult.success) {
			addErrors(
				key as keyof z.infer<T>,
				parseResult.error.issues.map((v) => v.message)
			);
		} else {
			addErrors(key as keyof z.infer<T>, []);
		}
		return parseResult;
	};
	/**
	 * Validate the entire form.
	 *
	 * @param {ExtendedData} extendedData - The data to validate, if none is provided it will validate the current form state.
	 * @returns {ParseResult<Initial>} The result of the validation.
	 */
	const validateAll = (extendedData?: Partial<Initial> | Partial<z.input<T>>) => {
		const parseAllResult = props.schema.safeParse({ ...value, ...extendedData });
		if (!parseAllResult.success) {
			parseAllResult.error.issues.forEach((v) => {
				result[v.path[0] as keyof z.infer<T>] = {
					...result[v.path[0] as keyof z.infer<T>],
					errors: [v.message],
					hasError: true,
					'aria-invalid': true
				};
			});
		}
		return parseAllResult;
	};

	const resetError = () => {
		Object.keys(result).forEach((key) => {
			result[key as keyof z.infer<T>].errors = [];
			result[key as keyof z.infer<T>].hasError = false;
			attribute[key as keyof z.infer<T>]['aria-invalid'] = false;
			attribute[key as keyof z.infer<T>].touched = false;
		});
		customError = {};
	};

	const setErrors = (newErrors: { [K in keyof typeof value]?: string[] }) => {
		Object.keys(newErrors).forEach((key) => {
			const theError = newErrors[key as keyof z.infer<T>];
			const hasError = theError !== undefined && Array.isArray(theError) && theError.length > 0;
			result[key as keyof z.infer<T>].errors = theError ?? [];
			result[key as keyof z.infer<T>].hasError = hasError;
			attribute[key as keyof z.infer<T>]['aria-invalid'] = hasError;
		});
	};

	const hasTouched = $derived(Object.values(attribute).some((v) => v.touched));
	const hasErrors = $derived(Object.values(result).some((v) => v.hasError));
	const canSubmit = $derived(hasTouched && !hasErrors);

	const resetAll = () => {
		value = keys.reduce((acc, value) => {
			if (initial && value in initial) {
				acc = {
					...acc,
					[value]: initial[value]
				};
			} else acc[value as NonNullable<keyof Initial>] = null!;
			return acc;
		}, {} as Initial);
		resetError();
	};

	const updateSchema = (schema: T) => {
		props.schema = schema;
	};

	const addAttribute = <K extends keyof z.infer<T>>(key: K, newAttribute: Record<string, any>) => {
		attribute[key] = {
			...attribute[key],
			...newAttribute
		};
	};

	return {
		get value() {
			return value;
		},
		set value(newValue) {
			value = newValue;
		},
		get attribute() {
			return attribute;
		},
		get result() {
			return result;
		},
		get hasErrors() {
			return hasErrors;
		},
		get canSubmit() {
			return canSubmit;
		},
		get customError() {
			return customError;
		},
		set customError(newError) {
			customError = newError;
		},
		addErrors,
		setValue,
		validate,
		validateAll,
		resetError,
		setErrors,
		resetAll,
		updateSchema,
		addAttribute,
		settleErrors
	};
}
