import { useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

type Category = {
  id: number;
  name: string;
  slug: string;
  iconUrl: string | null;
};

type CategoryCarouselProps = {
  categories: Category[];
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
};

export default function CategoryCarousel({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Split categories into two rows
  const allItems = [{ id: null, name: "Todos", slug: "todos", iconUrl: null }, ...categories];
  const midPoint = Math.ceil(allItems.length / 2);
  const firstRow = allItems.slice(0, midPoint);
  const secondRow = allItems.slice(midPoint);

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <button
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-white p-2 rounded-full shadow-lg transition-all"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-white p-2 rounded-full shadow-lg transition-all"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Carousel Container */}
      <div className="overflow-hidden px-12" ref={emblaRef}>
        <div className="flex flex-col gap-3">
          {/* First Row */}
          <div className="flex gap-3">
            {firstRow.map((item) => (
              <button
                key={item.id || "todos"}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === item.id
                    ? "bg-black text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => onSelectCategory(item.id)}
              >
                {item.id === null ? (
                  <span className="text-lg">★</span>
                ) : (
                  item.iconUrl && (
                    <img
                      src={item.iconUrl}
                      alt={item.name}
                      className="w-5 h-5 object-contain"
                    />
                  )
                )}
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          {/* Second Row */}
          {secondRow.length > 0 && (
            <div className="flex gap-3">
              {secondRow.map((item) => (
                <button
                  key={item.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === item.id
                      ? "bg-black text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                  onClick={() => onSelectCategory(item.id)}
                >
                  {item.iconUrl && (
                    <img
                      src={item.iconUrl}
                      alt={item.name}
                      className="w-5 h-5 object-contain"
                    />
                  )}
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
