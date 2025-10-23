import 'dotenv/config';
import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  extra: {
    apiUrl: process.env.API_URL || 'http://localhost:3000',
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    mapsProvider: process.env.MAPS_PROVIDER || 'google'
  }
});
