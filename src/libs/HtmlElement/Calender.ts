import { SubTask } from "../../interfaces/task/SubTask";
import { Task as TaskInterface } from "../../interfaces/task/Task";
import { getDateRange, nextDay } from "../Date/Date";
import { Task } from "../Task";
import { BoxMover } from "./BoxMover";
import { GanttChart } from "./GanttChart";
import { createElement, getElementFullWidth } from "./HtmlHelper";
import { TaskSelect } from "./Select/TaskSelect";

export class Calender extends GanttChart {
	private _originalMainBoxWidth = 0;
	public renderDayHeaders(): void {
		const row = createElement("div", "row");
		const { start, end } = getDateRange(this._tasks);
		let current: Date = start;
		while (current <= end) {
			const column = createElement(
				"div",
				"day",
				`${current.getFullYear()}\n${current.toLocaleString("en", { month: "short" })}\n${current
					.getDate()
					.toString()}`
			);

			row.id = "dateHeader";
			column.id = `${current.getTime()}`;

			row.appendChild(column);
			current = nextDay(current);
		}

		this._container.appendChild(row);
	}

	public drawLine(): void {
		const canvas = createElement("div", "column-lines-canvas");
		canvas.style.width = `${String(getElementFullWidth(this._container))}px`;
		// Get all elements with the class name 'day' within the 'dateHeader' ID
		const dayElements = document.querySelectorAll("#dateHeader .day");
		// Loop through each 'day' element
		dayElements.forEach((dayElement) => {
			const line = createElement("div", "column-line");
			const day = document.getElementById(dayElement.id);
			if (day) {
				line.style.transform = `translateX(${day.offsetLeft}px)`;
				line.style.color = `red`;
			}
			canvas.appendChild(line);
		});
		this._container.appendChild(canvas);
		this._container.style.height = "100%";
	}

	public renderTaskRows(): void {
		// eslint-disable-next-line array-callback-return
		this._tasks.forEach((task) => {
			const taskRow = this.createTaskElement(task);
			this._container.appendChild(taskRow);
			if (task.subTasks) {
				task.subTasks.forEach((subTask) => {
					const taskRow = this.createTaskElement(subTask);
					taskRow.classList.add("sub-task-row");
					this._container.appendChild(taskRow);
				});
			}
		});
		const boxMover = new BoxMover(this._tasks);
		boxMover.boxMoveEvent();
	}

	public renderCalender(): void {
		this._container.innerHTML = "";
		this.renderDayHeaders();
		this.renderTaskRows();
		this.drawLine();
	}

	public updateTasks(tasks: TaskInterface[]): void {
		this.renderCalender();
	}

	private _createTooltip(task: TaskInterface): HTMLElement {
		const tooltip = createElement("div", "task-box-text");
		tooltip.innerHTML = `<h6>${task.name}</h2>
							<span><strong>Start</strong> ${task.start}</span>
							<span><strong>End</strong> ${task.end}</span>`;

		return tooltip;
	}

	private _createTaskBox(task: TaskInterface): HTMLElement {
		const taskBox = createElement("div", "task-box", "");
		const progressEl = createElement("div", "progress");
		if (task.uid) {
			taskBox.setAttribute("data-uid", task.uid);
			taskBox.appendChild(progressEl);
			progressEl.style.width = `${task.completion}%`;
		}

		taskBox.style.position = "absolute";

		return taskBox;
	}

	private createTaskElement(task: TaskInterface | SubTask, isSubTask = false) {
		const row: HTMLElement = createElement("div", "task-row");
		const startDateModifier: HTMLElement = createElement("div", "start-date-mod");
		const endDateModifier = createElement("div", "end-date-mod");
		const midBox = createElement("div", "mid-box");
		endDateModifier.classList.add("box-modifier");
		startDateModifier.classList.add("box-modifier");
		const taskBox = this._createTaskBox(task);
		if (isSubTask) {
			taskBox.classList.add("sub-task-row");
		}
		if (!this._originalMainBoxWidth) {
			this._originalMainBoxWidth = this._container.scrollWidth - 10;
		}
		row.style.width = `${String(this._originalMainBoxWidth)}px`;
		const tooltip = this._createTooltip(task);
		taskBox.appendChild(tooltip);
		taskBox.appendChild(startDateModifier);
		taskBox.appendChild(endDateModifier);
		taskBox.appendChild(midBox);
		taskBox.addEventListener("mouseover", (event: MouseEvent): void => {
			tooltip.style.left = `${event.offsetX}px`;
		});
		const leftBox = document.getElementById(Date.parse(`${task.start}z`).toString());
		const leftCords = leftBox?.offsetLeft ?? 0;
		const rightBox =
			document.getElementById(Date.parse(`${task.end}z`).toString())?.offsetLeft ?? 0;
		const dayEl = document.querySelector("#dateHeader .day") as HTMLElement;

		const width: number = rightBox - leftCords + dayEl.offsetWidth;
		taskBox.style.left = `${leftCords}px`;
		taskBox.style.width = `${width}px`;
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		taskBox.style.top = `${document.getElementById(`task-side${task.name}`)?.offsetTop}px`;
		midBox.addEventListener("click", () => {
			new TaskSelect(this._inputs, this._tasks).updatePredecessorSuccessor(<string>task.parentTask);
			new Task().edit(task);
		});
		row.appendChild(taskBox);

		return row;
	}
}
