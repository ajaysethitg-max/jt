/** Structured data for search engines (schema.org JSON-LD). Rendered on the server. */
export function JsonLd({ graph }: { graph: Record<string, unknown>[] }) {
  const data = { "@context": "https://schema.org", "@graph": graph };
  return (
    <script
      type="application/ld+json"
      // "<" is escaped so the data can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
