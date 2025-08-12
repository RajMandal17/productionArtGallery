import { useState, useCallback, FormEvent, ChangeEvent } from 'react';

interface UseFormProps<T> {
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  setFieldValue: (name: keyof T, value: any) => void;
  resetForm: () => void;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate
}: UseFormProps<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate all fields
  const validateForm = useCallback(() => {
    if (!validate) return {};
    return validate(values);
  }, [validate, values]);

  // Handle field change
  const handleChange = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Handle checkboxes
    const val = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;
    
    setValues(prev => ({
      ...prev,
      [name]: val
    }));
  }, []);

  // Handle field blur
  const handleBlur = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    if (validate) {
      const validationErrors = validate(values);
      setErrors(prev => ({
        ...prev,
        ...validationErrors
      }));
    }
  }, [validate, values]);

  // Set a specific field value
  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    
    setTouched(allTouched);
    
    // Validate all fields
    const validationErrors = validate ? validate(values) : {};
    setErrors(validationErrors);
    
    // Check if there are any errors
    const hasErrors = Object.keys(validationErrors).length > 0;
    
    if (!hasErrors) {
      setIsSubmitting(true);
      
      Promise.resolve(onSubmit(values))
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  }, [values, validate, onSubmit]);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm
  };
}
