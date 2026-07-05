import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import AdBanner from './AdBanner';
import SearchableGallery from './SearchableGallery';

export default function Home() {
  // 1. Fetch the data from your CSV
  const filePath = path.join(process.cwd(), 'public', 'final_production_database.csv');
  const fileContents = fs.readFileSync(filePath, 'utf8');

const { data } = Papa.parse(fileContents, {
  header: true,
  skipEmptyLines: true,
  delimiter: ",", // Change this from "\t" to ","
  transformHeader: (header) => header.trim()
});

  // 2. Filter out any empty rows
  const validData = data.filter((row: any) => row.slug && row.cdn_url);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-gray-900">
            Preppy Wallpapers
          </h1>
          <p className="text-xl text-gray-500">
            Discover the ultimate collection of aesthetic, high-res downloads.
          </p>
        </header>

        {/* Layout: Main Gallery + Sticky Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Side: Search & Gallery (Takes up 75% of screen on desktop) */}
          <div className="flex-1">
            <SearchableGallery data={validData} />
          </div>

          {/* Right Side: Sticky Adsterra Sidebar (Takes up 25% of screen on desktop) */}
          <div className="w-full lg:w-[320px]">
            <div className="sticky top-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Advertisement</p>
              <AdBanner />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}