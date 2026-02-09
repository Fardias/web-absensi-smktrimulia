// Validation utilities
export const validators = {
  required: (value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'Field ini wajib diisi';
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Format email tidak valid';
    }
    return null;
  },

  minLength: (min) => (value) => {
    if (!value) return null;
    if (value.length < min) {
      return `Minimal ${min} karakter`;
    }
    return null;
  },

  maxLength: (max) => (value) => {
    if (!value) return null;
    if (value.length > max) {
      return `Maksimal ${max} karakter`;
    }
    return null;
  },

  numeric: (value) => {
    if (!value) return null;
    if (isNaN(value)) {
      return 'Harus berupa angka';
    }
    return null;
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Format nomor telepon tidak valid';
    }
    return null;
  },

  nis: (value) => {
    if (!value) return null;
    if (!/^\d{8,12}$/.test(value)) {
      return 'NIS harus 8-12 digit angka';
    }
    return null;
  },

  password: (value) => {
    if (!value) return null;
    if (value.length < 6) {
      return 'Password minimal 6 karakter';
    }
    return null;
  },

  confirmPassword: (originalPassword) => (value) => {
    if (!value) return null;
    if (value !== originalPassword) {
      return 'Konfirmasi password tidak cocok';
    }
    return null;
  }
};

// Validate form data
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]];
    const value = data[field];
    
    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break; // Stop at first error
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate file upload
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    required = false
  } = options;

  if (!file) {
    return required ? 'File wajib dipilih' : null;
  }

  if (file.size > maxSize) {
    return `Ukuran file maksimal ${Math.round(maxSize / 1024 / 1024)}MB`;
  }

  if (!allowedTypes.includes(file.type)) {
    return `Tipe file tidak didukung. Gunakan: ${allowedTypes.join(', ')}`;
  }

  return null;
};

// Rate limiting for client-side
export const createRateLimiter = (maxRequests, windowMs) => {
  const requests = [];
  
  return () => {
    const now = Date.now();
    
    // Remove old requests outside the window
    while (requests.length > 0 && requests[0] <= now - windowMs) {
      requests.shift();
    }
    
    if (requests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    requests.push(now);
    return true; // Request allowed
  };
};

// Example usage:
// const loginRateLimit = createRateLimiter(5, 60000); // 5 requests per minute