// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Local file upload (disk)
 * - Stores files under /uploads (already gitignored per your structure)
 * - Accepts multipart/form-data with "file" field
 * - Returns a public URL path (/uploads/...)
 * - No paid storage required
 */

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided. Use 'file' field in multipart/form-data." },
        { status: 400 },
      );
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique, safe filename
    const ext = path.extname(file.name) || '';
    const base = path
      .basename(file.name, ext)
      .replace(/[^\w\-]+/g, '_')
      .slice(0, 60);
    const hash = crypto
      .createHash('sha1')
      .update(buffer)
      .digest('hex')
      .slice(0, 8);
    const filename = `${base || 'file'}_${hash}${ext.toLowerCase()}`;
    const filepath = path.join(uploadsDir, filename);

    await fs.writeFile(filepath, buffer);

    // Public URL path (served by Next static file handling if you map /uploads in next.config or via custom static)
    // For simple local dev, you can expose /uploads by adding a static file server middleware or nginx rule.
    // As a quick win in dev, you can link directly to /uploads/<file> if using a custom static server.
    const urlPath = `/uploads/${filename}`;

    return NextResponse.json({
      ok: true,
      name: file.name,
      size: file.size,
      url: urlPath,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// (Optional) reject other methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
