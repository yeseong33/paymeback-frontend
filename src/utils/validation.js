export const validateEmail = (email) => {
  if (!email || email.length > 254) return false;

  // 로컬 파트: 영문, 숫자, 일부 특수문자 허용
  // 도메인: 영문, 숫자, 하이픈 허용, TLD는 2자 이상
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  if (!password || password.length < 8) return false;

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
};

export const getPasswordErrors = (password) => {
  const errors = [];
  if (!password) return ['비밀번호를 입력해주세요.'];
  if (password.length < 8) errors.push('8자 이상');
  if (!/[A-Z]/.test(password)) errors.push('대문자 포함');
  if (!/[a-z]/.test(password)) errors.push('소문자 포함');
  if (!/[0-9]/.test(password)) errors.push('숫자 포함');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('특수문자 포함');
  return errors;
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