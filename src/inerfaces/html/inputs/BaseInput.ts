export interface BaseInput {
	name: string;
	type: string;
	[key: string]: string | number | boolean | unknown;
}
