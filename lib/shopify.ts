const SHOPIFY_DOMAIN = 'shopaustralia.myshopify.com' // Your domain
const STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!

async function shopifyFetch({ query, variables = {} }: { query: string; variables?: any }) {
  const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  })
  return response.json()
}

export async function getProductsByHandles(handles: string[]) {
  const query = `
    query getProducts($handles: [String!]!) {
      products(first: 10, query: $handles) {
        edges {
          node {
            id
            title
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }
  `
  return shopifyFetch({ query, variables: { handles } })
}

export async function addToCart(variantId: string, quantity: number = 1) {
  // Use Shopify AJAX Cart API for non-headless stores
  const response = await fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: variantId, quantity }),
  })
  return response.json()
}
