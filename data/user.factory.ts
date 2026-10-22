import { faker } from '@faker-js/faker';
import { randomBytes } from 'node:crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Credentials {
  readonly email: string;
  readonly password: string;
}

export interface Address {
  street: string;
  postalCode: string;
  city: string;
  state: string;
  /** ISO 3166-1 alpha-2 country code, e.g. "US" */
  country: string;
}

export interface User extends Credentials {
  firstName: string;
  lastName: string;
  /** Date of birth in YYYY-MM-DD format (the format the registration form expects) */
  dateOfBirth: string;
  phone: string;
  address: Address;
}

/** Partial overrides, including a partial nested address */
export type UserOverrides = Partial<Omit<User, 'address'>> & {
  address?: Partial<Address>;
};

// ---------------------------------------------------------------------------
// Pre-existing accounts (seeded on practicesoftwaretesting.com)
// ---------------------------------------------------------------------------

export const CUSTOMER: Readonly<Credentials> = Object.freeze({
  email: 'customer@practicesoftwaretesting.com',
  password: 'welcome01',
});

export const CUSTOMER_2: Readonly<Credentials> = Object.freeze({
  email: 'customer2@practicesoftwaretesting.com',
  password: 'welcome01',
});

export const EXISTING_CUSTOMERS = Object.freeze([CUSTOMER, CUSTOMER_2] as const);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EMAIL_DOMAIN = 'example.com';

/** Short random hex string, safe for use in emails across parallel workers */
const uniqueSuffix = (): string =>
  `${Date.now().toString(36)}${randomBytes(3).toString('hex')}`;

/** Unique email, e.g. "qa.john.lx2k9f3a1b2c@example.com" */
export const generateUniqueEmail = (prefix = 'qa'): string =>
  `${prefix}.${uniqueSuffix()}@${EMAIL_DOMAIN}`.toLowerCase();

/**
 * Strong random password that satisfies the registration rules:
 * min 8 chars, upper + lower case, digit and symbol.
 */
export const generatePassword = (length = 14): string => {
  if (length < 8) {
    throw new Error('Password length must be at least 8 characters');
  }

  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%&*?';
  const all = upper + lower + digits + symbols;

  const required = [
    faker.helpers.arrayElement([...upper]),
    faker.helpers.arrayElement([...lower]),
    faker.helpers.arrayElement([...digits]),
    faker.helpers.arrayElement([...symbols]),
  ];

  const rest = Array.from({ length: length - required.length }, () =>
    faker.helpers.arrayElement([...all]),
  );

  return faker.helpers.shuffle([...required, ...rest]).join('');
};

/** Adult date of birth (18–65 years old) in YYYY-MM-DD format */
const generateDateOfBirth = (): string =>
  faker.date
    .birthdate({ mode: 'age', min: 18, max: 65 })
    .toISOString()
    .slice(0, 10);

/** Digits-only phone number (the form rejects formatting characters) */
const generatePhone = (): string => faker.string.numeric({ length: 10, allowLeadingZeros: false });

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export const createAddress = (overrides: Partial<Address> = {}): Address => ({
  street: faker.location.streetAddress(),
  postalCode: faker.location.zipCode('#####'),
  city: faker.location.city(),
  state: faker.location.state(),
  country: 'US',
  ...overrides,
});

/**
 * Builds a fresh, unique user for registration tests.
 *
 * @example
 * const user = createUser();
 * const userInNL = createUser({ address: { country: 'NL' } });
 */
export const createUser = (overrides: UserOverrides = {}): User => {
  const { address: addressOverrides, ...userOverrides } = overrides;
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    firstName,
    lastName,
    dateOfBirth: generateDateOfBirth(),
    phone: generatePhone(),
    email: generateUniqueEmail(firstName.replace(/[^a-z]/gi, '').toLowerCase() || 'qa'),
    password: generatePassword(),
    address: createAddress(addressOverrides),
    ...userOverrides,
  };
};

/** Builds several unique users at once */
export const createUsers = (count: number, overrides: UserOverrides = {}): User[] =>
  Array.from({ length: count }, () => createUser(overrides));

/** Extracts login credentials from a generated user */
export const toCredentials = ({ email, password }: User): Credentials => ({ email, password });