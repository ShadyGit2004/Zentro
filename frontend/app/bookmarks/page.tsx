import AppShell from "@/components/layout/AppShell";
import Bookmark from "@/features/bookmarks/components/Bookmarks";
import { getTranslations } from "next-intl/server";

const BookmarksPage = async () => {
  const t = await getTranslations("bookmarks");
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <Bookmark />
      </div>
    </AppShell>
  );
};

export default BookmarksPage;
