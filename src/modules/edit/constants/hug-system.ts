

export const HUG_HEIGHT = 48;

export const MIN_HUGS = 1;
export const MAX_GRID_ROWS = 50;
export const GRID_COLS = 2;

export function pixelsToHugs(pixels: number): number {
	return Math.max(MIN_HUGS, Math.ceil(pixels / HUG_HEIGHT));
}

export function hugsToPixels(hugs: number): number {
	return hugs * HUG_HEIGHT;
}

export function snapToHugBoundary(pixels: number): number {
	return Math.round(pixels / HUG_HEIGHT) * HUG_HEIGHT;
}
