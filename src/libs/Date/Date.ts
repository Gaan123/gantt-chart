import { DateRange } from "../../interfaces/date/DateRange";
import { Task } from "../../interfaces/task/Task";

export function getEarliestDate(tasks: Task[]): Date {
	const latestEndDate = new Date(Math.min(...tasks.map((t) => new Date(t.start).getTime())));

	return new Date(latestEndDate);
}

export function getLatestDate(tasks: Task[]): Date {
	const latestEndDate = new Date(Math.max(...tasks.map((t) => new Date(t.end).getTime())));

	return new Date(latestEndDate);
}
export function getSunday(date: Date): Date {
	// const date = new Date(earliestDate);

	// Calculate the weekday number (0 for Sunday)
	const dayOfWeek = date.getDay();

	// Subtract weekday number from date to get previous Sunday
	date.setDate(date.getDate() - dayOfWeek);

	// console.log(date.getDate() - dayOfWeek);
	return date;
}
export function getSaturday(date: Date): Date {
	// const date = new Date(earliestDate);

	// Calculate the weekday number (0 for Sunday)
	const dayOfWeek = date.getDay();

	// Subtract weekday number from date to get previous Sunday
	const daysToAdd = (6 - dayOfWeek + 7) % 7;

	// Add days to get the next Saturday's date
	date.setDate(date.getDate() + daysToAdd);

	// console.log(date.getDate() - dayOfWeek);
	return date;
}
export function getDateRange(tasks: Task[]): DateRange {
	const earliest = getEarliestDate(tasks);
	const latest = getLatestDate(tasks);
	getSunday(earliest);
	getSaturday(latest);

	return {
		start: earliest,
		end: latest,
	};
}
export function nextDay(date: Date): Date {
	const next = new Date(date);
	next.setDate(date.getDate() + 1);

	return next;
}

export class DateHelper {
	private readonly _dates: string[];

	constructor(dates: string[]) {
		this._dates = dates;
	}

	public earliestDate(): Date | undefined {
		return new Date(Math.min(...this.sanitizeDates().map((d: Date) => d.getTime())));
	}

	public latestDate(): Date | undefined {
		return new Date(Math.max(...this.sanitizeDates().map((d: Date) => d.getTime())));
	}

	private sanitizeDates(): Date[] {
		if (this._dates.length === 0) {
			return [];
		}

		const dates = this._dates.map((dateStr) => {
			const date = new Date(dateStr);

			return isNaN(date.getTime()) ? undefined : date;
		});

		return dates.filter(Boolean) as Date[];
	}
}
