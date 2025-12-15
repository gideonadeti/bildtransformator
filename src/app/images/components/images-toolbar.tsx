import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { ImagesFilterState } from "../../hooks/use-images-filter";
import { formatBytes, formatMegabytes, parseMegabytesInput } from "../../utils/format";

interface ImagesToolbarProps {
  filters: ImagesFilterState;
  minSizeInData: number;
  maxSizeInData: number;
  availableFormats: string[];
  hasActiveFilters: boolean;
  onFiltersChange: (patch: Partial<ImagesFilterState>) => void;
  onClearFilters: () => void;
}

const ImagesToolbar = ({
  filters,
  minSizeInData,
  maxSizeInData,
  availableFormats,
  hasActiveFilters,
  onFiltersChange,
  onClearFilters,
}: ImagesToolbarProps) => {
  const [minSizeInput, setMinSizeInput] = useState(
    formatMegabytes(filters.minSize)
  );
  const [maxSizeInput, setMaxSizeInput] = useState(
    formatMegabytes(filters.maxSize)
  );

  useEffect(() => {
    if (filters.minSize == null) {
      setMinSizeInput("");
    }
  }, [filters.minSize]);

  useEffect(() => {
    if (filters.maxSize == null) {
      setMaxSizeInput("");
    }
  }, [filters.maxSize]);

  const handleNameChange = (value: string) => {
    onFiltersChange({ name: value });
  };

  const handleMinSizeChange = (value: string) => {
    setMinSizeInput(value);
    onFiltersChange({ minSize: parseMegabytesInput(value) });
  };

  const handleMaxSizeChange = (value: string) => {
    setMaxSizeInput(value);
    onFiltersChange({ maxSize: parseMegabytesInput(value) });
  };

  const handleFormatChange = (value: string) => {
    onFiltersChange({ format: value === "all" ? null : value });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-") as [
      ImagesFilterState["sortBy"],
      ImagesFilterState["sortOrder"]
    ];

    onFiltersChange({ sortBy, sortOrder });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        {/* Name filter - always first, takes most horizontal space */}
        <div className="w-full lg:flex-1 lg:min-w-0 space-y-1">
          <p className="text-sm font-medium">Name filter</p>
          <InputGroup className="min-w-0">
            <InputGroupAddon>
              <InputGroupText>
                <Search className="size-4" />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              className="min-w-0"
              placeholder="Search by image name"
              value={filters.name}
              onChange={(event) => handleNameChange(event.target.value)}
            />
          </InputGroup>
        </div>

        {/* Size filter - sits after name filter */}
        <div className="w-full lg:w-auto space-y-1">
          <div className="space-y-1">
            <p className="text-sm font-medium">Size filter</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <InputGroup className="max-w-[160px]">
                <InputGroupAddon>
                  <InputGroupText>Min</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  inputMode="decimal"
                  placeholder={formatBytes(minSizeInData)}
                value={minSizeInput}
                  onChange={(event) => handleMinSizeChange(event.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>MB</InputGroupText>
                </InputGroupAddon>
              </InputGroup>

              <InputGroup className="max-w-[160px]">
                <InputGroupAddon>
                  <InputGroupText>Max</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  inputMode="decimal"
                  placeholder={formatBytes(maxSizeInData)}
                value={maxSizeInput}
                  onChange={(event) => handleMaxSizeChange(event.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>MB</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        </div>

        {/* Format filter - sits after size filter */}
        <div className="w-full sm:w-[180px] space-y-1">
          <p className="mb-1 text-sm font-medium">Format filter</p>
          <Select
            value={filters.format || "all"}
            onValueChange={handleFormatChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All formats" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All formats</SelectItem>
              {availableFormats.map((format) => (
                <SelectItem key={format} value={format}>
                  {format.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort - always last, fixed visual width */}
        <div className="w-full sm:w-[260px]">
          <p className="mb-1 text-sm font-medium">Sort</p>
          <Select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort images" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">
                Upload date — newest first
              </SelectItem>
              <SelectItem value="date-asc">
                Upload date — oldest first
              </SelectItem>
              <SelectItem value="name-asc">Name — A → Z</SelectItem>
              <SelectItem value="name-desc">Name — Z → A</SelectItem>
              <SelectItem value="size-asc">
                File size — smallest first
              </SelectItem>
              <SelectItem value="size-desc">
                File size — largest first
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImagesToolbar;
