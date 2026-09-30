import { auth } from '@clerk/nextjs/server'
import React from 'react'

async function StudioPage() {
  // Authoritative guard for this resource: middleware only redirects signed-out users,
  // so the server component itself also requires a session.
  await auth.protect()

  return (
    <div>
       
    </div>
  )
}

export default StudioPage
