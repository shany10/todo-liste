export type User = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  birthdate: string; // ISO date string: YYYY-MM-DD
  passwordHash: string;
};

export type UserInput = {
  firstname: string;
  lastname: string;
  email: string;
  birthdate: string; // YYYY-MM-DD
  password: string; // raw, unencrypted
};

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: ValidationError[] };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export function validateUser(input: UserInput): ValidationResult {
  const errors: ValidationError[] = [];

  // firstname
  if (!input.firstname || input.firstname.trim().length === 0) {
    errors.push({ field: "firstname", message: "Le prénom est requis." });
  }

  // lastname
  if (!input.lastname || input.lastname.trim().length === 0) {
    errors.push({ field: "lastname", message: "Le nom est requis." });
  }

  // email
  if (!input.email || !EMAIL_REGEX.test(input.email.trim())) {
    errors.push({ field: "email", message: "L'adresse email n'est pas valide." });
  }

  // password
  const pwd = input.password ?? "";
  if (pwd.length < 8 || pwd.length > 40) {
    errors.push({
      field: "password",
      message: "Le mot de passe doit contenir entre 8 et 40 caractères.",
    });
  } else {
    if (!/[a-z]/.test(pwd)) {
      errors.push({
        field: "password",
        message: "Le mot de passe doit contenir au moins une minuscule.",
      });
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push({
        field: "password",
        message: "Le mot de passe doit contenir au moins une majuscule.",
      });
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push({
        field: "password",
        message: "Le mot de passe doit contenir au moins un chiffre.",
      });
    }
  }

  // age >= 13
  if (!input.birthdate) {
    errors.push({ field: "birthdate", message: "La date de naissance est requise." });
  } else {
    const age = getAge(input.birthdate);
    if (isNaN(age) || age < 13) {
      errors.push({
        field: "birthdate",
        message: "Vous devez avoir au moins 13 ans.",
      });
    }
  }

  if (errors.length > 0) return { valid: false, errors };
  return { valid: true };
}
