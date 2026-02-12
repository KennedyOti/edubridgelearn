export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/register',
    LOGIN: '/login',
    LOGOUT: '/logout',
    USER: '/user',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    EMAIL_VERIFICATION: {
      RESEND: '/email/resend',
      VERIFY: (id: string, hash: string) => `/email/verify/${id}/${hash}`,
      RESEND_UNAUTHENTICATED: '/email/resend-unauthenticated', 
    },
  },
} as const;