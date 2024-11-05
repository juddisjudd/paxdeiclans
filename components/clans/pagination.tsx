import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center space-x-2 mt-6">
      <Button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="bg-[#B3955D] hover:bg-[#8C714A] text-white"
      >
        Previous
      </Button>
      <span className="flex items-center px-4 py-2 bg-white border border-[#B3955D] rounded-md">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="bg-[#B3955D] hover:bg-[#8C714A] text-white"
      >
        Next
      </Button>
    </div>
  );
}