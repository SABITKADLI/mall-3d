export function LoadingScreen() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontFamily: 'sans-serif',
      }}
    >
      <div className="spinner" />
      <p style={{ fontSize: '18px', margin: 0 }}>Loading Virtual Mall...</p>
      <p style={{ fontSize: '12px', margin: 0, opacity: 0.8 }}>
        Fetching products from Shopify...
      </p>
    </div>
  )
}
