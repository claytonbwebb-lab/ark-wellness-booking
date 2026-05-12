import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  const html = readFileSync(join(process.cwd(), 'public', 'holistic-wellness', 'index.html'), 'utf8')
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
