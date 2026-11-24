import { Component, ElementRef, HostListener, Input, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

interface CalendarDay {
  day: number;
  iso: string;
  isDisabled: boolean;
  isSelected: boolean;
  isToday: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

@Component({
  selector: 'app-date-picker',
  standalone: true,
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ]
})
export class DatePickerComponent implements ControlValueAccessor {
  @Input() invalid = false;
  @Input() max: string | null = null;
  @Input() placeholder = 'dd/mm/yyyy';
  @Input() inputId = '';

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  value = '';
  isOpen = false;
  isDisabled = false;
  viewYear = new Date().getFullYear();
  viewMonth = new Date().getMonth();

  readonly weekDays = WEEKDAYS;

  get monthLabel(): string {
    return MONTHS[this.viewMonth];
  }

  get displayValue(): string {
    if (!this.value) return '';
    const [year, month, day] = this.value.split('-').map(Number);
    return `${String(day).padStart(2, '0')} ${MONTHS[month - 1].slice(0, 3)} ${year}`;
  }

  get years(): number[] {
    const current = new Date().getFullYear();
    const selectedYear = this.value ? Number(this.value.slice(0, 4)) : current;
    const minYear = Math.min(1900, selectedYear);
    const result: number[] = [];
    for (let year = current; year >= minYear; year--) {
      result.push(year);
    }
    return result;
  }

  get days(): (CalendarDay | null)[] {
    const firstDay = new Date(this.viewYear, this.viewMonth, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const totalDays = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const todayIso = this.toIso(new Date());
    const cells: (CalendarDay | null)[] = [];

    for (let index = 0; index < offset; index++) {
      cells.push(null);
    }

    for (let day = 1; day <= totalDays; day++) {
      const iso = this.toIso(new Date(this.viewYear, this.viewMonth, day));
      cells.push({
        day,
        iso,
        isDisabled: this.max ? iso > this.max : false,
        isSelected: iso === this.value,
        isToday: iso === todayIso
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }

  get canGoPrev(): boolean {
    const selectedYear = this.value ? Number(this.value.slice(0, 4)) : 0;
    const minYear = Math.min(1900, selectedYear);
    return this.viewYear > minYear || this.viewMonth > 0;
  }

  get canGoNext(): boolean {
    if (!this.max) return true;
    const [maxYear, maxMonth] = this.max.split('-').map(Number);
    return this.viewYear < maxYear || (this.viewYear === maxYear && this.viewMonth < maxMonth - 1);
  }

  writeValue(value: string | null): void {
    this.value = value ?? '';
    if (this.value) {
      const [year, month] = this.value.split('-').map(Number);
      this.viewYear = year;
      this.viewMonth = month - 1;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  toggle(): void {
    if (this.isDisabled) return;

    if (!this.isOpen && !this.value) {
      const today = new Date();
      this.viewYear = today.getFullYear();
      this.viewMonth = today.getMonth();
    }

    this.isOpen = !this.isOpen;
    this.onTouched();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.host.nativeElement.contains(event.target as Node)) {
      this.isOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen = false;
  }

  prevMonth(): void {
    if (!this.canGoPrev) return;
    if (this.viewMonth === 0) {
      this.viewMonth = 11;
      this.viewYear--;
    } else {
      this.viewMonth--;
    }
  }

  nextMonth(): void {
    if (!this.canGoNext) return;
    if (this.viewMonth === 11) {
      this.viewMonth = 0;
      this.viewYear++;
    } else {
      this.viewMonth++;
    }
  }

  onYearChange(event: Event): void {
    const year = Number((event.target as HTMLSelectElement).value);
    if (!year) return;
    this.viewYear = year;

    if (this.max) {
      const [maxYear, maxMonth] = this.max.split('-').map(Number);
      if (this.viewYear === maxYear && this.viewMonth > maxMonth - 1) {
        this.viewMonth = maxMonth - 1;
      }
    }
  }

  selectDay(day: CalendarDay): void {
    if (day.isDisabled) return;
    this.value = day.iso;
    this.onChange(this.value);
    this.onTouched();
    this.isOpen = false;
  }

  clear(): void {
    this.value = '';
    this.onChange('');
    this.onTouched();
    this.isOpen = false;
  }

  private toIso(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
