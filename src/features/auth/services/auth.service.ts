import { executeGraphQL } from '@/services/api/graphqlClient';
import type {
  AuthResponse,
  RegisterResponse,
  LoginInput,
  RegisterInput,
  GoogleLoginInput,
  GoogleRegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdatePasswordInput,
} from '../types/auth.types';

// ----------------------------------------------------
// GraphQL Fragments & Queries
// ----------------------------------------------------

const USER_FIELDS_FRAGMENT = `
  fragment UserFields on User {
    _id
    firstName
    lastName
    email
    authProvider
    googleId
    role
    phoneNumber
    dateOfBirth
    address {
      city
      street
    }
    isEmailVerified
    isBanned
    ratingStats {
      averageRating
      totalReviews
      asSellerAverageRating
      asSellerTotalReviews
      asBuyerAverageRating
      asBuyerTotalReviews
      breakdown {
        oneStar
        twoStar
        threeStar
        fourStar
        fiveStar
      }
    }
    createdAt
    updatedAt
  }
`;

const LOGIN_MUTATION = `
  ${USER_FIELDS_FRAGMENT}
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      accessToken
      refreshToken
      user {
        ...UserFields
      }
    }
  }
`;

const REGISTER_MUTATION = `
  mutation Register($registerInput: RegisterInput!) {
    register(registerInput: $registerInput) {
      success
      message
    }
  }
`;

const GOOGLE_LOGIN_MUTATION = `
  ${USER_FIELDS_FRAGMENT}
  mutation GoogleLogin($googleLoginInput: GoogleLoginInput!) {
    googleLogin(googleLoginInput: $googleLoginInput) {
      accessToken
      refreshToken
      user {
        ...UserFields
      }
    }
  }
`;

const GOOGLE_REGISTER_MUTATION = `
  ${USER_FIELDS_FRAGMENT}
  mutation GoogleRegister($googleRegisterInput: GoogleRegisterInput!) {
    googleRegister(googleRegisterInput: $googleRegisterInput) {
      accessToken
      refreshToken
      user {
        ...UserFields
      }
    }
  }
`;

const CONFIRM_EMAIL_MUTATION = `
  mutation ConfirmEmail($token: String!) {
    confirmEmail(token: $token)
  }
`;

const RESEND_CONFIRMATION_EMAIL_MUTATION = `
  mutation ResendConfirmationEmail($email: String!) {
    resendConfirmationEmail(email: $email)
  }
`;

const FORGOT_PASSWORD_MUTATION = `
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input)
  }
`;

const RESET_PASSWORD_MUTATION = `
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input)
  }
`;

const UPDATE_PASSWORD_MUTATION = `
  mutation UpdatePassword($input: UpdatePasswordInput!) {
    updatePassword(input: $input)
  }
`;

const REFRESH_TOKEN_MUTATION = `
  ${USER_FIELDS_FRAGMENT}
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
      user {
        ...UserFields
      }
    }
  }
`;

const LOGOUT_MUTATION = `
  mutation Logout($refreshToken: String!) {
    logout(refreshToken: $refreshToken)
  }
`;

const LOGOUT_ALL_MUTATION = `
  mutation LogoutAll {
    logoutAll
  }
`;

const REQUEST_REACTIVATION_MUTATION = `
  mutation RequestReactivation($email: String!) {
    requestReactivation(email: $email)
  }
`;

const CONFIRM_REACTIVATION_MUTATION = `
  mutation ConfirmReactivation($token: String!) {
    confirmReactivation(token: $token)
  }
`;


function normalizeEgyptianPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '').replace(/^(\+?20)/, '0');
  return cleaned.startsWith('0') ? cleaned : `0${cleaned}`;
}

// ----------------------------------------------------
// Auth Service API Methods
// ----------------------------------------------------

export const authService = {
  login: async (input: LoginInput): Promise<AuthResponse> => {
    const data = await executeGraphQL<{ login: AuthResponse }>(LOGIN_MUTATION, {
      loginInput: input,
    });
    return data.login;
  },

  register: async (input: RegisterInput): Promise<RegisterResponse> => {
    const normalizedInput: RegisterInput = {
      ...input,
      phoneNumber: normalizeEgyptianPhone(input.phoneNumber),
    };
    const data = await executeGraphQL<{ register: RegisterResponse }>(REGISTER_MUTATION, {
      registerInput: normalizedInput,
    });
    return data.register;
  },

  googleLogin: async (input: GoogleLoginInput): Promise<AuthResponse> => {
    const data = await executeGraphQL<{ googleLogin: AuthResponse }>(GOOGLE_LOGIN_MUTATION, {
      googleLoginInput: input,
    });
    return data.googleLogin;
  },

  googleRegister: async (input: GoogleRegisterInput): Promise<AuthResponse> => {
    const data = await executeGraphQL<{ googleRegister: AuthResponse }>(GOOGLE_REGISTER_MUTATION, {
      googleRegisterInput: input,
    });
    return data.googleRegister;
  },

  confirmEmail: async (token: string): Promise<boolean> => {
    const data = await executeGraphQL<{ confirmEmail: boolean }>(CONFIRM_EMAIL_MUTATION, {
      token,
    });
    return data.confirmEmail;
  },

  resendConfirmationEmail: async (email: string): Promise<boolean> => {
    const data = await executeGraphQL<{ resendConfirmationEmail: boolean }>(
      RESEND_CONFIRMATION_EMAIL_MUTATION,
      { email }
    );
    return data.resendConfirmationEmail;
  },

  forgotPassword: async (input: ForgotPasswordInput): Promise<boolean> => {
    const data = await executeGraphQL<{ forgotPassword: boolean }>(FORGOT_PASSWORD_MUTATION, {
      input,
    });
    return data.forgotPassword;
  },

  resetPassword: async (input: ResetPasswordInput): Promise<boolean> => {
    const data = await executeGraphQL<{ resetPassword: boolean }>(RESET_PASSWORD_MUTATION, {
      input,
    });
    return data.resetPassword;
  },

  updatePassword: async (input: UpdatePasswordInput): Promise<boolean> => {
    const data = await executeGraphQL<{ updatePassword: boolean }>(UPDATE_PASSWORD_MUTATION, {
      input,
    });
    return data.updatePassword;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const data = await executeGraphQL<{ refreshToken: AuthResponse }>(REFRESH_TOKEN_MUTATION, {
      refreshToken,
    });
    return data.refreshToken;
  },

  logout: async (refreshToken: string): Promise<boolean> => {
    const data = await executeGraphQL<{ logout: boolean }>(LOGOUT_MUTATION, {
      refreshToken,
    });
    return data.logout;
  },

  logoutAll: async (): Promise<boolean> => {
    const data = await executeGraphQL<{ logoutAll: boolean }>(LOGOUT_ALL_MUTATION);
    return data.logoutAll;
  },

  requestReactivation: async (email: string): Promise<boolean> => {
    const data = await executeGraphQL<{ requestReactivation: boolean }>(
      REQUEST_REACTIVATION_MUTATION,
      { email }
    );
    return data.requestReactivation;
  },

  confirmReactivation: async (token: string): Promise<boolean> => {
    const data = await executeGraphQL<{ confirmReactivation: boolean }>(
      CONFIRM_REACTIVATION_MUTATION,
      { token }
    );
    return data.confirmReactivation;
  },
};
