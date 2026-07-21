import { useState, useCallback } from "react";

/**
 * useForm — standardized form state with optional validation.
 * @param {object} initialValues
 * @param {function} [validation] - (values) => errorObject
 */
export const useForm = (initialValues, validation = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (validation) {
      setErrors(validation(values));
    }
  }, [values, validation]);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const validate = useCallback(() => {
    if (!validation) return true;
    const fieldErrors = validation(values);
    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  }, [values, validation]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = useCallback((callback) => async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);
    const isValid = validate();
    if (!isValid) { setIsSubmitting(false); return; }
    try {
      await callback(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    validate,
    reset,
  };
};
