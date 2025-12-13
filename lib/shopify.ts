'use server'

const SHOPIFY_ENDPOINT = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_NAME}.myshopify.com/api/2024-01/graphql.json`
const SHOPIFY_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message: string; extensions?: { code?: string } }>
}

async function shopifyRequest<T>(query: string, variables?: Record<string, any>): Promise<T> {
  if (!SHOPIFY_ACCESS_TOKEN) {
    throw new Error('Shopify access token not configured')
  }

  const response = await fetch(SHOPIFY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_ACCESS_TOKEN,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    next: { revalidate: 60 },
  })

  const result: GraphQLResponse<T> = await response.json()

  if (result.errors) {
    console.error('Shopify API Error:', result.errors)
    const notFound = result.errors.some(
      (e) => e.message === 'Not Found' || e.extensions?.code === 'NOT_FOUND'
    )
    if (notFound) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return {} as T
    }
    throw new Error(result.errors[0]?.message || 'Shopify API Error')
  }

  return result.data as T
}

// ==================== TYPE DEFINITIONS ====================

interface CollectionNode {
  id: string
  title: string
  handle: string
  products: {
    edges: Array<{
      node: {
        id: string
      }
    }>
  }
}

interface CollectionEdge {
  cursor: string
  node: CollectionNode
}

interface ProductVariantNode {
  id: string
  title: string
  availableForSale: boolean
  price: {
    amount: string
    currencyCode: string
  }
  selectedOptions: Array<{
    name: string
    value: string
  }>
  image?: {
    src: string
    altText?: string
  }
}

interface ProductNode {
  id: string
  title: string
  handle: string
  description: string
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  images: {
    edges: Array<{
      node: {
        src: string
        altText: string
      }
    }>
  }
  variants: {
    edges: Array<{
      node: ProductVariantNode
    }>
  }
  options: Array<{
    name: string
    values: string[]
  }>
}

interface ProductEdge {
  cursor: string
  node: ProductNode
}

// ==================== COLLECTION QUERIES ====================

export async function getCollections() {
  let allCollections: Array<{
    id: string
    title: string
    handle: string
    productsCount: number
  }> = []
  let hasNextPage = true
  let cursor: string | null = null
  const BATCH_SIZE = 250

  console.log('🔄 Starting to fetch ALL collections from Shopify Storefront API...')
  console.log('📝 Note: Only collections published to "Online Store" channel will appear')

  while (hasNextPage) {
    // Added @inContext directive for AU catalog pricing
    const query = `
      query getCollections($first: Int!, $after: String) @inContext(country: AU) {
        collections(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              title
              handle
              products(first: 250) {
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

    const data: {
      collections?: {
        pageInfo: {
          hasNextPage: boolean
          endCursor: string | null
        }
        edges?: CollectionEdge[]
      }
    } = await shopifyRequest(query, { first: BATCH_SIZE, after: cursor })

    if (!data || !data.collections || !data.collections.edges) {
      console.warn('⚠️ No collections returned from Shopify.')
      break
    }

    console.log(`📥 Received ${data.collections.edges.length} collections in this batch`)

    const collectionsWithProducts = data.collections.edges
      .map((edge: CollectionEdge) => {
        const productCount = edge.node.products.edges.length
        console.log(` • ${edge.node.title}: ${productCount} products`)
        return {
          edge,
          productCount,
        }
      })
      .filter((item) => item.productCount > 0)
      .map((item) => ({
        id: item.edge.node.id,
        title: item.edge.node.title,
        handle: item.edge.node.handle,
        productsCount: item.productCount,
      }))

    allCollections = [...allCollections, ...collectionsWithProducts]

    console.log(
      `📦 Collections with products in this batch: ${collectionsWithProducts.length}/${data.collections.edges.length}`
    )
    console.log(`📊 Total collections with products so far: ${allCollections.length}`)

    hasNextPage = data.collections.pageInfo.hasNextPage
    cursor = data.collections.pageInfo.endCursor

    if (!hasNextPage) {
      console.log(`✅ Finished fetching all collections. Total: ${allCollections.length}`)
    }
  }

  if (allCollections.length === 0) {
    console.error('❌ NO COLLECTIONS FOUND!')
    console.error('⚠️ POSSIBLE REASONS:')
    console.error(' 1. Collections are not published to "Online Store" sales channel')
    console.error(' 2. Products in collections are not available to Storefront API')
    console.error(' 3. Storefront API access token permissions are incorrect')
    console.error(' 4. Collections exist but have no products')
    console.error('')
    console.error('🔧 TO FIX IN SHOPIFY ADMIN:')
    console.error(' 1. Go to Products → Collections')
    console.error(' 2. For each collection, click "Manage" → "Sales channels"')
    console.error(' 3. Make sure "Online Store" is checked')
    console.error(' 4. Save changes')
  }

  return allCollections
}

// ==================== PRODUCT QUERIES ====================

export async function getProductsByCollection(collectionHandle: string) {
  let allProducts: Array<{
    id: string
    title: string
    handle: string
    description: string
    price: number
    image: string
    collectionHandle: string
    variantId: string
    variants: Array<{
      id: string
      title: string
      availableForSale: boolean
      price: number
      selectedOptions: Array<{
        name: string
        value: string
      }>
      image?: {
        src: string
        altText?: string
      }
    }>
    options: Array<{
      name: string
      values: string[]
    }>
  }> = []
  let hasNextPage = true
  let cursor: string | null = null
  const BATCH_SIZE = 250

  while (hasNextPage) {
    // Added @inContext directive for AU catalog pricing
    const query = `
      query getCollectionProducts($handle: String!, $first: Int!, $after: String) @inContext(country: AU) {
        collection(handle: $handle) {
          products(first: $first, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              cursor
              node {
                id
                title
                handle
                description
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 1) {
                  edges {
                    node {
                      src
                      altText
                    }
                  }
                }
                variants(first: 100) {
                  edges {
                    node {
                      id
                      title
                      availableForSale
                      price {
                        amount
                        currencyCode
                      }
                      selectedOptions {
                        name
                        value
                      }
                      image {
                        src
                        altText
                        } 
                    }
                  }
                }
                options {
                  name
                  values
                }
              }
            }
          }
        }
      }
    `

    const response: {
      collection?: {
        products?: {
          pageInfo: {
            hasNextPage: boolean
            endCursor: string | null
          }
          edges?: ProductEdge[]
        }
      } | null
    } = await shopifyRequest(query, { handle: collectionHandle, first: BATCH_SIZE, after: cursor })

    if (
      !response.collection ||
      !response.collection.products ||
      !response.collection.products.edges
    ) {
      break
    }

    const products = response.collection.products.edges.map((edge: ProductEdge) => {
    const node = edge.node
    return {
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      price: parseFloat(node.priceRange.minVariantPrice.amount),
      image: node.images.edges[0]?.node.src || '/placeholder.jpg',
      collectionHandle,
      variantId: node.variants.edges[0]?.node.id || '',
      variants: node.variants.edges.map((v) => ({
        id: v.node.id,
        title: v.node.title,
        availableForSale: v.node.availableForSale,
        price: parseFloat(v.node.price.amount),
        selectedOptions: v.node.selectedOptions,
        image: v.node.image
          ? { src: v.node.image.src, altText: v.node.image.altText }
          : undefined,
      })),
      options: node.options,
    }
  })

    allProducts = [...allProducts, ...products]

    hasNextPage = response.collection.products.pageInfo.hasNextPage
    cursor = response.collection.products.pageInfo.endCursor
  }

  return allProducts
}

export async function getProduct(productHandle: string) {
  const query = `
    query getProduct($handle: String!) @inContext(country: AU) {
      product(handle: $handle) {
        id
        title
        handle
        description
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 10) {
          edges {
            node {
              src
              altText
            }
          }
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
              image {
                src
                altText
              }
            }
          }
        }
        options {
          name
          values
        }
      }
    }
  `

  const response = await shopifyRequest<{
    product: {
      id: string
      title: string
      handle: string
      description: string
      priceRange: {
        minVariantPrice: {
          amount: string
          currencyCode: string
        }
      }
      images: {
        edges: Array<{
          node: {
            src: string
            altText: string
          }
        }>
      }
      variants: {
        edges: Array<{
          node: ProductVariantNode
        }>
      }
      options: Array<{
        name: string
        values: string[]
      }>
    }
  }>(query, { handle: productHandle })

  const product = response.product

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    price: parseFloat(product.priceRange.minVariantPrice.amount),
    images: product.images.edges.map((edge) => ({
      src: edge.node.src,
      alt: edge.node.altText || product.title,
    })),
    variantId: product.variants.edges[0]?.node.id || '',
    variants: product.variants.edges.map((v) => ({
  id: v.node.id,
  title: v.node.title,
  availableForSale: v.node.availableForSale,
  price: parseFloat(v.node.price.amount),
  selectedOptions: v.node.selectedOptions,
  image: v.node.image
    ? { src: v.node.image.src, altText: v.node.image.altText }
    : undefined,
    })),

    options: product.options,
  }
}

// ==================== CART OPERATIONS ====================

export async function createCart() {
  // Cart with AU context for catalog pricing
  const query = `
    mutation createCart($input: CartInput!) @inContext(country: AU) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const response = await shopifyRequest<{
    cartCreate: {
      cart: {
        id: string
        checkoutUrl: string
      }
      userErrors: Array<{ field: string; message: string }>
    }
  }>(query, { input: {} })

  if (response.cartCreate.userErrors.length > 0) {
    throw new Error(response.cartCreate.userErrors[0].message)
  }

  return response.cartCreate.cart
}

export async function addToCart(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>
) {
  // Add to cart with AU context
  const query = `
    mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) @inContext(country: AU) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product {
                      title
                      handle
                    }
                    price {
                      amount
                    }
                    image {
                      src
                    }
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const response = await shopifyRequest<{
    cartLinesAdd: {
      cart: {
        id: string
        lines: {
          edges: Array<{
            node: {
              id: string
              quantity: number
              merchandise: {
                id: string
                title: string
                product: {
                  title: string
                  handle: string
                }
                price: {
                  amount: string
                }
                image: {
                  src: string
                }
              }
            }
          }>
        }
      }
      userErrors: Array<{ field: string; message: string }>
    }
  }>(query, { cartId, lines })

  if (response.cartLinesAdd.userErrors.length > 0) {
    throw new Error(response.cartLinesAdd.userErrors[0].message)
  }
  return response.cartLinesAdd.cart
}

export async function getCart(cartId: string) {
  // Get cart with AU context for catalog pricing
  const query = `
    query getCart($cartId: ID!) @inContext(country: AU) {
      cart(id: $cartId) {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          src
                        }
                      }
                    }
                  }
                  price {
                    amount
                  }
                }
              }
            }
          }
        }
        cost {
          subtotalAmount {
            amount
          }
          totalAmount {
            amount
          }
        }
      }
    }
  `

  const response = await shopifyRequest<{
    cart: {
      id: string
      checkoutUrl: string
      lines: {
        edges: Array<{
          node: {
            id: string
            quantity: number
            merchandise: {
              id: string
              title: string
              product: {
                title: string
                handle: string
                images: {
                  edges: Array<{
                    node: {
                      src: string
                    }
                  }>
                }
              }
              price: {
                amount: string
              }
            }
          }
        }>
      }
      cost: {
        subtotalAmount: {
          amount: string
        }
        totalAmount: {
          amount: string
        }
      }
    }
  }>(query, { cartId })

  const cart = response.cart

  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    items: cart.lines.edges.map((edge) => {
      const node = edge.node
      return {
        id: node.id,
        productId: node.merchandise.id,
        title: node.merchandise.product.title,
        quantity: node.quantity,
        price: parseFloat(node.merchandise.price.amount),
        image: node.merchandise.product.images.edges[0]?.node.src || '/placeholder.jpg',
      }
    }),
    subtotal: parseFloat(cart.cost.subtotalAmount.amount),
    total: parseFloat(cart.cost.totalAmount.amount),
  }
}

export async function removeFromCart(cartId: string, lineIds: string[]) {
  // Remove from cart with AU context
  const query = `
    mutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) @inContext(country: AU) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const response = await shopifyRequest<{
    cartLinesRemove: {
      cart: {
        id: string
      }
      userErrors: Array<{ field: string; message: string }>
    }
  }>(query, { cartId, lineIds })

  return response.cartLinesRemove.cart
}

export async function getCheckoutUrl(cartId: string) {
  const cart = await getCart(cartId)
  return cart.checkoutUrl
}

