"use client";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export interface Profile {
  id: string;
  email: string;
  name?: string;
  role?: "admin" | "teacher" | "student" | "parent";
  phone?: string;
  instrument?: string;
}

export function useProfile(email?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }
    loadProfile();
  }, [email]);

  async function loadProfile() {
    const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

    if (!error) {
      setProfile(data);
    }
    setLoading(false);
  }

  return { profile, loading, reload: loadProfile };
}