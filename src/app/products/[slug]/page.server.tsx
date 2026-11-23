import { ProductPage, generateProductMetadata } from "./product-view";

// Server mode (page.server.tsx): no generateStaticParams, so every product
// page is rendered at request time and prices, stock and deal timers are
// always fresh.
export const generateMetadata = generateProductMetadata;
export default ProductPage;
