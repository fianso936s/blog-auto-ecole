import product from "../../../packages/product/product.json";
// Public configuration only. No database password, Apple key or Google server key belongs here.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || product.apiOrigin).replace(
  /\/$/,
  "",
);
export const AUTH_CALLBACK = "reperespot://auth";
