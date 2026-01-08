"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import ContactSalesButton from "@/components/ContactSalesButton";

export default function GlobalContactSalesButton() {
  const { user, loading } = useAuth();

  // Don't show while loading or if not logged in
  if (loading || !user) {
    return null;
  }

  return <ContactSalesButton />;
}
