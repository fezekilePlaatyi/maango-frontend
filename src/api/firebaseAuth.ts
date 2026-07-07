import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { IdentityDocument, Role, User } from "@/types";
import { authApi } from "./realApi";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  if (!credential.user.email) throw new Error("Email account did not return an email address.");
  return authApi.session(credential.user.email, password);
}

export async function registerWithEmail(input: { email: string; password: string; name: string; role: Role; identityDocument?: IdentityDocument }): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, input.email.trim().toLowerCase(), input.password);
  await updateProfile(credential.user, { displayName: input.name });
  return authApi.register({
    id: credential.user.uid,
    email: credential.user.email || input.email,
    name: input.name,
    role: input.role,
    identityDocument: input.identityDocument,
  });
}

export async function signInWithGoogle(role: Role = "client", identityDocument?: IdentityDocument): Promise<User> {
  const result = await signInWithPopup(auth, provider);
  const firebaseUser = result.user;
  const email = firebaseUser.email;

  if (!email) {
    throw new Error("Google account did not return an email address.");
  }

  try {
    return await authApi.session(email, "");
  } catch {
    return authApi.register({
      id: firebaseUser.uid,
      email,
      name: firebaseUser.displayName || email.split("@")[0],
      role,
      identityDocument,
    });
  }
}
