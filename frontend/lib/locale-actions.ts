"use server";

import { cookies } from "next/headers";

const locales = ["en", "hi", "fr", "zh", "pt", "es", "ru"] as const;
type Locale = (typeof locales)[number];

function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export async function setLocale(locale: string) {
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}`);
  }

  const cookieStore = await cookies();
  cookieStore.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: false, // client-readable so JS can also read it
    sameSite: "lax",
  });
}
