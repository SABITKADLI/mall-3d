# Deployment Issues Fix - TODO

## Completed Tasks
- [x] Remove unused `cartId` assignment in CheckoutClient.tsx
- [x] Remove unused `halfDepth` calculation in MallLayout.tsx
- [x] Add `handleCheckout` to the useEffect dependencies in CartOverlay.tsx
- [x] Fix @typescript-eslint/no-explicit-any errors in ProductOverlay.tsx, VirtualJoystick.tsx, and lib/shopify.ts
- [x] Fix react-hooks/exhaustive-deps warning in ProductOverlay.tsx
- [x] Replace <img> with <Image /> from next/image in ProductOverlay.tsx

## Summary
All deployment issues have been resolved:
- Fixed @typescript-eslint/no-unused-vars errors for 'cartId' and 'halfDepth'
- Fixed react-hooks/exhaustive-deps warning for missing 'handleCheckout' dependency
- Fixed @typescript-eslint/no-explicit-any errors by replacing 'any' with proper types
- Fixed @next/next/no-img-element warning by using Next.js Image component
