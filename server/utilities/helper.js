'use strict'

const Joi = require('joi')
const config = require('config')
// const moment = require('moment')

const apiHeaders = () => {
  return Joi.object({
    authorization: Joi.string()
  }).options({
    allowUnknown: true
  })
}

const addLeadingZeros = (num, totalLength) => {
  return String(num).padStart(totalLength, '0');
}

const toTitleCase = (inputString) => {
  return inputString.toLowerCase().split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

const stringToSlug = (inputString) => {
  // Replace spaces with hyphens and remove special characters
  const slug = inputString
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '') // Remove special characters
    .toLowerCase(); // Convert to lowercase
  return slug;
}

const generateUsername = (firstName, lastName) => {
  const initials = `${firstName.charAt(0).toLowerCase()}${lastName.charAt(0).toLowerCase()}`;
  const randomString = Math.random().toString(36).substring(2, 8); // Generate a random alphanumeric string
  const username = `${initials}_${randomString}`;
  return username;
};

const generatePassword = (firstName, lastName) => {
  const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  const numbers = '0123456789';
  const getRandomChar = (charSet) => charSet[Math.floor(Math.random() * charSet.length)];
  const passwordArray = [
    firstName.slice(0, 1).toUpperCase(),
    lastName.slice(0, 1).toLowerCase(),
    getRandomChar(specialChars),
    getRandomChar(numbers)
  ];
  const remainingChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = passwordArray.length; i < 8; i++) {
    passwordArray.push(getRandomChar(remainingChars));
  }
  const shuffledPasswordArray = passwordArray.sort(() => Math.random() - 0.5);
  const password = shuffledPasswordArray.join('');
  return password;
  // 1 uppercase letter from firstName.
  // 1 lowercase letter from lastName.
  // 1 random special character.
  // 1 random number.
  // 4 additional random letters.
  // Shuffled to ensure unpredictability.
}

const checkLoginPermssion = async (type, userDetail) => {
  let valid = false
  if(type){
    type = type.toLowerCase()
    // 0 = Admin,  1 = Students, Super Admin = 2 
    let adminAccessRoles =  [0,2]
    let appAccessRoles =  [1]
    if (userDetail) {
      if (type === 'admin' && adminAccessRoles.indexOf(userDetail.user_level) > -1) {
        valid = true
      } else if (type === 'app' && appAccessRoles.indexOf(userDetail.user_level) > -1) {
        valid = true
      }
    }
  }
  return valid
}

const customJoi = Joi.extend((joi) => ({
  type: 'formattedContactNo',
  base: joi.string(),
  messages: {
    'formattedContactNo.invalid': 'Contact number must be 10 digits long.',
  },
  validate(value, helpers) {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      return { value, errors: helpers.error('formattedContactNo.invalid') };
    }
    const formatted = `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    return { value: formatted };
  }
})).extend((joi) => ({
  type: 'validZipCode',
  base: joi.string(),
  messages: {
    'validZipCode.invalid': 'Zip code must be exactly 6 digits long.',
  },
  validate(value, helpers) {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 6) {
      return { value, errors: helpers.error('validZipCode.invalid') };
    }
    return { value: cleaned };
  }
})).extend((joi) => ({
  type: 'lowercaseEmail',
  base: joi.string(),
  messages: {
      'lowercaseEmail.invalid': 'Invalid email format',
  },
  validate(value, helpers) {
      const email = value.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
          return { value, errors: helpers.error('lowercaseEmail.invalid') };
      }
      return { value: email };
  }
}));

module.exports = {
  stringToSlug,
  toTitleCase,
  apiHeaders,
  addLeadingZeros,
  generateUsername,
  generatePassword,
  checkLoginPermssion,
  customJoi
}