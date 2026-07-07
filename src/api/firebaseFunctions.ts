import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

export async function callFunction<TResponse>(name: string, data?: unknown): Promise<TResponse> {
  const callable = httpsCallable(functions, name);
  const result = await callable(data);
  return result.data as TResponse;
}

export async function callFunctionWithTimeout<TResponse>(name: string, data?: unknown, timeoutMs = 7000): Promise<TResponse> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      callFunction<TResponse>(name, data),
      new Promise<TResponse>((_, reject) => {
        timeout = setTimeout(() => reject(new Error(`${name} timed out`)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
