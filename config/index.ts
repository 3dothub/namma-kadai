const API_URL = 'https://api-namma-kadai.vercel.app';

export const config = {
  apiUrl: API_URL,
  auth: {
    login: `${API_URL}/auth/login`,
    register: `${API_URL}/auth/register`,
    verify: `${API_URL}/auth/verify`,
  },
};

export default config;
