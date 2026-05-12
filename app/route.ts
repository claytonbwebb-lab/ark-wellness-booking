import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET(request: Request) {
  const html = readFileSync(join(process.cwd(), 'public', 'original-site.html'), 'utf8')
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
