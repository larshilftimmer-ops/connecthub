"use client";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    setLoading(false);
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    if (error) throw new Error("Login fehlgeschlagen");
    await checkUser();
  }

  async function register(email: string, password: string, data: any) {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password 
    });
    if (error) throw new Error("Registrierung fehlgeschlagen");
    
    await supabase.from("profiles").insert({ 
      email, 
     ...data 
    });
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return { user, loading, login, register, logout };
}