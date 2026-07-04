import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

function getDatabase() {
  const filePath = path.join(process.cwd(), 'public', 'final_production_database.csv');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data } = Papa.parse(fileContents, { 
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });
  return data;
}

export async function generateStaticParams() {
  const db = getDatabase();
  return db
    // Reverted back to cdn_url for production
    .filter((row: any) => row.slug && row.cdn_url && row.cdn_url.trim() !== '') 
    .map((row: any) => ({
      slug: row.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const db = getDatabase();
  const pageData = db.find((row: any) => row.slug === resolvedParams.slug) as any;
  
  if (!pageData) return { title: 'Not Found' };

  return {
    title: pageData.title,
    description: pageData.body_text?.substring(0, 150) + '...',
  };
}

export default async function ImagePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const db = getDatabase();
  const pageData = db.find((row: any) => row.slug === resolvedParams.slug) as any;

  if (!pageData) return <div className="p-10 text-center text-2xl">Page not found</div>;

  // Reverted back to cdn_url for production
  const safeUrl = pageData.cdn_url?.trim() || null;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "ImageObject",
    "contentUrl": safeUrl,
    "name": pageData.title,
    "description": pageData.body_text,
    "keywords": pageData.keyword
  };

  return (
    <main className="max-w-4xl mx-auto p-6 font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <h1 className="text-4xl font-bold mb-6 text-gray-900">{pageData.title}</h1>
      
      <div className="w-full rounded-2xl overflow-hidden shadow-xl mb-8">
        {safeUrl ? (
            <img 
              src={safeUrl} 
              alt={pageData.keyword} 
              className="w-full h-auto object-cover"
              loading="lazy"
            />
        ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                Image Currently Unavailable
            </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-10 items-center bg-gray-50 p-6 rounded-2xl">
        {safeUrl ? (
            <a 
              href={safeUrl} 
              target="_blank"
              download 
              className="bg-pink-500 text-white px-8 py-4 rounded-xl font-bold w-full md:w-1/2 text-center hover:bg-pink-600 transition shadow-md"
            >
              Download Free High-Res Image
            </a>
        ) : (
            <button disabled className="bg-gray-400 text-white px-8 py-4 rounded-xl font-bold w-full md:w-1/2 text-center cursor-not-allowed">
              Download Unavailable
            </button>
        )}
        
        <div className="w-full md:w-1/2 flex justify-center items-center min-h-[250px] bg-gray-200 rounded-xl border-2 border-dashed border-gray-300 text-gray-500">
          <p>Adsterra Monetization Zone</p>
        </div>
      </div>

      <article className="prose lg:prose-xl max-w-none text-gray-700 leading-relaxed">
        <p>{pageData.body_text}</p>
      </article>
    </main>
  );
}