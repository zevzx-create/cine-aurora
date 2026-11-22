import { Platform } from 'react-native';

const HOST_CELULAR = '192.168.0.10';

const host = Platform.OS === 'web' ? 'localhost' : HOST_CELULAR;

export const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${host}:5080`;
