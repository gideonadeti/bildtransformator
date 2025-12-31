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

import type { TransformedImagesFilterState } from "../../hooks/use-transformed-images-filter";
import { formatBytes, formatMegabytes, parseMegabytesInput } from "../../utils/format";

interface TransformedImagesToolbarProps {
  filters: TransformedImagesFilterState;
  minSizeInData: number;
  maxSizeInData: number;
  hasActiveFilters: boolean;
  onFiltersChange: (patch: Partial<TransformedImagesFilterState>) => void;
  onClearFilters: () => void;
  isTransformedTransformedImages?: boolean;
}

const TransformedImagesToolbar = ({
  filters,
  minSizeInData,
  maxSizeInData,
  hasActiveFilters,
  onFiltersChange,
  onClearFilters,
  isTransformedTransformedImages = false,
}: TransformedImagesToolbarProps) => {
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

  const handleMinSizeChange = (value: string) => {
    setMinSizeInput(value);
    onFiltersChange({ minSize: parseMegabytesInput(value) });
  };

  const handleMaxSizeChange = (value: string) => {
    setMaxSizeInput(value);
    onFiltersChange({ maxSize: parseMegabytesInput(value) });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-") as [
      TransformedImagesFilterState["sortBy"],
      TransformedImagesFilterState["sortOrder"]
    ];

    onFiltersChange({ sortBy, sortOrder });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        {/* Size filter */}
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

        {/* Sort */}
        <div className="w-full sm:w-[260px]">
          <p className="mb-1 text-sm font-medium">Sort</p>
          <Select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  isTransformedTransformedImages
                    ? "Sort transformed transformed images"
                    : "Sort transformed images"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">
                Transformation date — newest first
              </SelectItem>
              <SelectItem value="date-asc">
                Transformation date — oldest first
              </SelectItem>
              <SelectItem value="size-asc">
                File size — smallest first
              </SelectItem>
              <SelectItem value="size-desc">
                File size — largest first
              </SelectItem>
              <SelectItem value="downloads-desc">
                Downloads — most first
              </SelectItem>
              <SelectItem value="downloads-asc">
                Downloads — least first
              </SelectItem>
              <SelectItem value="likes-desc">
                Likes — most first
              </SelectItem>
              <SelectItem value="likes-asc">
                Likes — least first
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

export default TransformedImagesToolbar;

