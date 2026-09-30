"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { setLocale } from "@/lib/locale-actions";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "fr", label: "Français" },
  { code: "zh", label: "中文" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Español" },
  { code: "ru", label: "Русский" },
] as const;

export default function LanguageSwitcher() {
  const t = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    startTransition(async () => {
      await setLocale(newLocale);
      router.refresh();
    });
  };

  const currentLanguage =
    LANGUAGES.find((lang) => lang.code === locale) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isPending}
          aria-label={t("select")}
        >
          <Globe className="h-4 w-4" />
          <span>{currentLanguage.label}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[140px]">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLocaleChange(lang.code)}
            className={locale === lang.code ? "font-medium" : ""}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
