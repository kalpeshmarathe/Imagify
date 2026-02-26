import { getFunctions, connectFunctionsEmulator, type Functions } from "firebase/functions";
import { app } from "./firebase";

let _functions: Functions | null = null;

/** Get Firebase Functions with region. Use emulator when NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR=true (avoids CORS on localhost). */
export function getAppFunctions(): Functions | null {
  if (!app) return null;
  if (_functions) return _functions;

  const region = "us-central1";
  _functions = getFunctions(app, region);

  if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR === "true"
  ) {
    connectFunctionsEmulator(_functions, "localhost", 5001);
  }

  return _functions;
}
