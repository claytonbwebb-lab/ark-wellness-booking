import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export async function GET() {
  const filePath = join(process.cwd(), 'public', 'original-site.html')
  const html = readFileSync(filePath, 'utf8')
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export default function Page() {
  return null
}
