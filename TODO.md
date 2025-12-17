# Deployment Issues Fix - TODO

## Completed Tasks
- [x] Remove unused `cartId` assignment in CheckoutClient.tsx
- [x] Remove unused `halfDepth` calculation in MallLayout.tsx
- [x] Add `handleCheckout` to the useEffect dependencies in CartOverlay.tsx

## Summary
All deployment issues have been resolved:
- Fixed @typescript-eslint/no-unused-vars errors for 'cartId' and 'halfDepth'
- Fixed react-hooks/exhaustive-deps warning for missing 'handleCheckout' dependency
