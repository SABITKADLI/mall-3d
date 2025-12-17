declare module 'three/examples/jsm/utils/SkeletonUtils.js' {
  import { Object3D } from 'three'
  export const SkeletonUtils: {
    clone<T extends Object3D>(source: T): T
  }
}