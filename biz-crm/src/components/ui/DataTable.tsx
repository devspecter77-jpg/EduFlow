import * as React from "react";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./Table";
import { SearchInput } from "./SearchInput";
import { Pagination } from "./Pagination";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";
import { Select } from "./Select";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  paginated?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  className?: string;
}

type SortDirection = "asc" | "desc" | null;

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = "Qidirish...",
  onSearch,
  paginated = true,
  pageSize: initialPageSize = 10,
  emptyMessage = "Ma'lumot topilmadi",
  className,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = React.useState("");
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  // Search filtering
  const filteredData = React.useMemo(() => {
    if (!searchValue) return data;

    return data.filter((row) => {
      return columns.some((column) => {
        const value = row[column.key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchValue.toLowerCase());
      });
    });
  }, [data, searchValue, columns]);

  // Sorting
  const sortedData = React.useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = React.useMemo(() => {
    if (!paginated) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, paginated]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1); // Reset to first page on search
    onSearch?.(value);
  };

  // Handle sort
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  // Render sort icon
  const renderSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    if (sortDirection === "asc") {
      return <ChevronUp className="ml-2 h-4 w-4 text-primary" />;
    }
    return <ChevronDown className="ml-2 h-4 w-4 text-primary" />;
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {searchable && (
          <SearchInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            onClear={() => handleSearch("")}
            disabled
          />
        )}
        <div className="rounded-lg border">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Yuklanmoqda..." />
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = paginatedData.length === 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and page size */}
      {(searchable || paginated) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {searchable && (
            <div className="w-full sm:w-80">
              <SearchInput
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                onClear={() => handleSearch("")}
              />
            </div>
          )}
          {paginated && !isEmpty && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Har sahifada:
              </span>
              <Select
                options={[
                  { label: "10", value: "10" },
                  { label: "20", value: "20" },
                  { label: "50", value: "50" },
                  { label: "100", value: "100" },
                ]}
                value={String(pageSize)}
                onChange={handlePageSizeChange}
                className="w-20"
              />
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        {isEmpty ? (
          <EmptyState title={emptyMessage} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      style={{ width: column.width }}
                      className={cn(
                        column.sortable && "cursor-pointer select-none"
                      )}
                      onClick={() =>
                        column.sortable && handleSort(column.key)
                      }
                    >
                      <div className="flex items-center">
                        {column.header}
                        {column.sortable && renderSortIcon(column.key)}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {column.render
                          ? column.render(row)
                          : String(row[column.key] ?? "-")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination and info */}
      {paginated && !isEmpty && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {sortedData.length} tadan {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, sortedData.length)} ko'rsatilmoqda
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
