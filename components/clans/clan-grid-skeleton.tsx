export function ClanGridSkeleton() {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden border-[#B3955D] bg-white flex flex-col h-[500px] rounded-lg border animate-pulse"
          >
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#B3955D]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#B3955D]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#B3955D]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#B3955D]" />
  
            {/* Image skeleton */}
            <div className="relative h-48 flex-shrink-0 bg-gray-200">
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <div className="bg-black/50 px-2 py-1 rounded text-xs w-24 h-6" />
                <div className="w-6 h-6 rounded bg-black/50" />
              </div>
            </div>
  
            {/* Content Section */}
            <div className="flex flex-col flex-1 p-6">
              {/* Title skeleton */}
              <div className="py-2 space-y-2 text-center">
                <div className="h-7 bg-gray-200 rounded w-2/3 mx-auto" />
                <div className="flex gap-1.5 justify-center mt-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-5 w-16 bg-gray-200 rounded px-2 py-0.5" />
                  ))}
                </div>
              </div>
  
              {/* Description skeleton */}
              <div className="flex-1 py-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-4/6" />
                </div>
              </div>
  
              {/* Location & Language skeleton */}
              <div className="flex justify-between text-sm py-1.5 border-t border-[#B3955D]/20">
                <div className="flex items-center gap-1">
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
              </div>
  
              {/* Discord button skeleton */}
              <div className="py-2 space-y-2">
                <div className="h-10 bg-gray-200 rounded w-full" />
                <div className="flex justify-center items-center gap-2">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }