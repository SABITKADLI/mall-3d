import { Text } from '@react-three/drei'

export function TextTest() {
  return (
    <Text
      position={[0, 2, 0]}
      fontSize={1}
      color="red"
      anchorX="center"
      anchorY="middle"
    >
      TEST TEXT
    </Text>
  )
}
