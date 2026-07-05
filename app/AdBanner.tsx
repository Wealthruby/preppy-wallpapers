// app/AdBanner.tsx
export default function AdBanner() {
  return (
    <div className="flex flex-col items-center justify-center my-4 w-full">
      <iframe
        src="/ad.html"
        width="300"
        height="250"
        frameBorder="0"
        scrolling="no"
      ></iframe>
    </div>
  );
}