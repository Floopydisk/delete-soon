"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerWithPresetsProps {
  className?: string;
  selected?: Date;
  onSelect: (date?: Date) => void;
  /** Earliest year selectable in the dropdown navigation */
  fromYear?: number;
  /** Latest year selectable in the dropdown navigation */
  toYear?: number;
  /** Use 'dropdown' (month+year selects) or 'label' (arrows only) */
  navigationMode?: "dropdown" | "label";
}

export function DatePickerWithPresets({
  className,
  selected,
  onSelect,
  fromYear = new Date().getFullYear() - 50,
  toYear = new Date().getFullYear() + 10,
  navigationMode = "dropdown",
}: DatePickerWithPresetsProps) {
  const [date, setDate] = React.useState<Date | undefined>(selected);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (onSelect) {
      onSelect(selectedDate);
    }
  };

  const handlePresetChange = (value: string) => {
    const now = new Date();
    let presetDate: Date | undefined = undefined;
    switch (value) {
      case "today":
        presetDate = now;
        break;
      case "yesterday":
        presetDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1
        );
        break;
      case "last7":
        presetDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 6
        );
        break;
      case "last30":
        presetDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 29
        );
        break;
      case "thisMonth":
        presetDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        break;
    }
    handleSelect(presetDate);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "LLL dd, y") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex items-center justify-between gap-2 p-2">
            <Select onValueChange={handlePresetChange}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Preset" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7">6 Days Ago</SelectItem>
                <SelectItem value="last30">29 Days Ago</SelectItem>
                <SelectItem value="thisMonth">First of Month</SelectItem>
              </SelectContent>
            </Select>
            {date && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handleSelect(undefined)}
              >
                Clear
              </Button>
            )}
          </div>
          <Calendar
            initialFocus
            mode="single"
            defaultMonth={date}
            selected={date}
            onSelect={(d) => handleSelect(d)}
            numberOfMonths={1}
            captionLayout={navigationMode === "dropdown" ? "dropdown" : "label"}
            fromYear={fromYear}
            toYear={toYear}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
