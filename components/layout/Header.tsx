import HeaderClient from "./HeaderClient";
import { categoryUrl } from "@/lib/routes";
import { getHeaderNavigation } from "@/lib/publicData";

export default async function Header() {
  const categories = await getHeaderNavigation();

  return (
    <HeaderClient
      productCategories={categories.map((category) => ({
        name: category.name,
        href: categoryUrl(category.slug),
      }))}
    />
  );
}
