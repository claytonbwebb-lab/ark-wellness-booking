import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export function middleware() {
  const filePath = join(process.cwd(), 'public', 'original-site.html')
  const html = readFileSync(filePath, 'utf8')
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export const config = {
  matcher: '/',
}
