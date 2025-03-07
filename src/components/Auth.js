import React from "react";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const Auth = () => {
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error al iniciar sesión con Google", error);
    }
  };

  return (
    <div>
      <h2>Iniciar sesión</h2>
      <button onClick={signInWithGoogle}>Iniciar sesión con Google</button>
    </div>
  );
};

export default Auth;
