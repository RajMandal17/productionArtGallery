import { useState, useCallback } from 'react';

type ValidationRules = {
  [key: string]: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    validate?: (value: any) => boolean | string;
  };
};

type ValidationErrors = {
  [key: string]: string;
};

export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validate a single field
  const validateField = useCallback(
    (name: string, value: any): string => {
      const rules = validationRules[name];
      if (!rules) return '';

      if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        return 'This field is required';
      }

      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        return `Minimum length is ${rules.minLength} characters`;
      }

      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        return `Maximum length is ${rules.maxLength} characters`;
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        return 'Invalid format';
      }

      if (rules.validate) {
        const validationResult = rules.validate(value);
        if (typeof validationResult === 'string') {
          return validationResult;
        }
        if (validationResult === false) {
          return 'Invalid value';
        }
      }

      return '';
    },
    [validationRules]
  );

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setValues((prevValues) => ({ ...prevValues, [name]: value }));

      if (touched[name]) {
        const error = validateField(name, value);
        setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
      }
    },
    [validateField, touched]
  );

  // Mark field as touched on blur
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));
      const error = validateField(name, value);
      setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    },
    [validateField]
  );

  // Set value programmatically
  const setValue = useCallback((name: string, value: any) => {
    setValues((prevValues) => ({ ...prevValues, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    }
  }, [validateField, touched]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(validationRules).forEach((key) => {
      allTouched[key] = true;
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setTouched(allTouched);
    setErrors(newErrors);
    return isValid;
  }, [validateField, values, validationRules]);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setValue,
    validateForm,
    resetForm,
    setValues,
  };
};
