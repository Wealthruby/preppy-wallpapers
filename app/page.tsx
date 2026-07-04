import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import Link from 'next/link';

export default function Home() {
  const filePath = path.join(process.cwd(), 'public', 'final_production_database.csv');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  
  const { data } = Papa.parse(fileContents, { 
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });

  // Reverted back to cdn_url for production
  const validData = data.filter((row: any) => row.slug && row.cdn_url);

  return (
    <main className="max-w-6xl mx-auto p-6 font-sans">
      <div className="text-center mb-12 mt-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Preppy Wallpapers</h1>
        <p className="text-xl text-gray-600">Discover the ultimate collection of aesthetic, high-res downloads.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {validData.map((item: any, index: number) => (
          <Link href={`/${item.slug}`} key={index} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition duration-300 border border-gray-100">
            <div className="overflow-hidden h-72">
              <img 
                src={item.cdn_url?.trim()} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
              />
            </div>
            <div className="p-5">
              <h2 className="text-lg font-bold text-gray-800 line-clamp-1">{item.title}</h2>
              <p className="text-sm text-pink-500 font-semibold mt-2">Download Free &rarr;</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}