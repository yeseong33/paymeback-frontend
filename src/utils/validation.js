export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 8;
};

export const validateName = (name) => {
  return name && name.trim().length > 0 && name.trim().length <= 50;
};

export const validateOTP = (otp) => {
  const otpRegex = /^[0-9]{6}$/;
  return otpRegex.test(otp);
};

export const validateGatheringTitle = (title) => {
  return title && title.trim().length > 0 && title.trim().length <= 100;
};

export const validateGatheringDescription = (description) => {
  return !description || description.length <= 500;
};

export const validateAmount = (amount) => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount > 0;
};

export const getValidationErrors = (formData, validationRules) => {
  const errors = {};
  
  for (const [field, rules] of Object.entries(validationRules)) {
    const value = formData[field];
    
    for (const rule of rules) {
      if (!rule.validate(value)) {
        errors[field] = rule.message;
        break;
      }
    }
  }
  
  return errors;
};