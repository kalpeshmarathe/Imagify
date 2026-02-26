import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.imagify.app",
  appName: "Imagify",
  webDir: "out",
  server: {
    // For local dev: uncomment to load from Next.js dev server
    // url: "http://localhost:3000",
    // cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
