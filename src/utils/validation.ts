export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ValidationResult<T> {
  valid: boolean;
  errors: Record<string, string>;
  sanitized?: T;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContactInput(input: ContactInput): ValidationResult<ContactInput> {
  const errors: Record<string, string> = {};

  const name = input.name.trim();
  const email = input.email.trim();
  const subject = input.subject.trim();
  const message = input.message.trim();

  if (name.length < 2) {
    errors.name = 'Please enter your name (at least 2 characters).';
  } else if (name.length > 100) {
    errors.name = 'Name must be 100 characters or fewer.';
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address.';
  } else if (email.length > 160) {
    errors.email = 'Email address is too long.';
  }

  if (subject.length < 3) {
    errors.subject = 'Please provide a brief subject (at least 3 characters).';
  } else if (subject.length > 160) {
    errors.subject = 'Subject must be 160 characters or fewer.';
  }

  if (message.length < 10) {
    errors.message = 'Please include a message of at least 10 characters.';
  } else if (message.length > 3000) {
    errors.message = 'Message must be 3000 characters or fewer.';
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    sanitized: { name, email, subject, message },
  };
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isValidHttpUrl(url: string): boolean {
  if (!url.trim()) return true;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
