import SearchPageClient from "@/components/public/SearchPageClient";

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";

  return <SearchPageClient query={query} />;
}
