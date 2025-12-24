// Form validation utilities
export interface ValidationRules {
  [key: string]: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    message?: string;
    validate?: (value: string) => string | undefined;
    isEmail?: boolean;
    isNumeric?: boolean;
    min?: number;
    max?: number;
    matchesField?: string;
  };
}

export interface ValidationErrors {
  [key: string]: string;
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  PHONE: /^\+?[\d\s-]{10,}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  CREDIT_CARD: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})$/,
  DATE_YYYY_MM_DD: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
};

export const validateForm = <T extends Record<string, any>>(
  data: T,
  rules: ValidationRules
): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = data[field] as string;
    const fieldLabel = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors[field] = rule.message || `${fieldLabel} is required`;
      return;
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) return;

    // Custom validation function
    if (rule.validate) {
      const error = rule.validate(value);
      if (error) {
        errors[field] = error;
        return;
      }
    }

    // Email validation
    if (rule.isEmail && !VALIDATION_PATTERNS.EMAIL.test(value)) {
      errors[field] = rule.message || 'Please enter a valid email address';
      return;
    }

    // Numeric validation
    if (rule.isNumeric && isNaN(Number(value))) {
      errors[field] = rule.message || `${fieldLabel} must be a number`;
      return;
    }

    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = rule.message || `${fieldLabel} must be at least ${rule.minLength} characters`;
      return;
    }

    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = rule.message || `${fieldLabel} must be at most ${rule.maxLength} characters`;
      return;
    }

    // Minimum value validation (for numbers)
    if (rule.min !== undefined && !isNaN(Number(value)) && Number(value) < rule.min) {
      errors[field] = rule.message || `${fieldLabel} must be at least ${rule.min}`;
      return;
    }

    // Maximum value validation (for numbers)
    if (rule.max !== undefined && !isNaN(Number(value)) && Number(value) > rule.max) {
      errors[field] = rule.message || `${fieldLabel} must be at most ${rule.max}`;
      return;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${fieldLabel} is invalid`;
      return;
    }

    // Field matching validation (e.g., password confirmation)
    if (rule.matchesField && data[rule.matchesField] !== value) {
      errors[field] = rule.message || `${fieldLabel} does not match`;
    }
  });

  return errors;
};

// Helper function to check if there are any validation errors
export const hasErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

// Helper function to get the first error message
export const getFirstError = (errors: ValidationErrors): string | null => {
  const firstErrorKey = Object.keys(errors)[0];
  return firstErrorKey ? errors[firstErrorKey] : null;
};
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, // At least one lowercase, one uppercase, one digit
};

// Common validation rules
export const commonValidationRules = {
  login: {
    email: {
      required: true,
      pattern: validationPatterns.email,
      message: 'Please enter a valid email address'
    },
    password: {
      required: true,
      minLength: 6,
      message: 'Password must be at least 6 characters'
    }
  },
  register: {
    name: {
      required: true,
      minLength: 2,
      message: 'Name must be at least 2 characters'
    },
    email: {
      required: true,
      pattern: validationPatterns.email,
      message: 'Please enter a valid email address'
    },
    password: {
      required: true,
      minLength: 6,
      message: 'Password must be at least 6 characters'
    },
    phone: {
      required: true,
      pattern: validationPatterns.phone,
      message: 'Please enter a valid phone number'
    }
  }
};
