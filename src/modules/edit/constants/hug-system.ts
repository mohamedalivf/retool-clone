/**
 * Hug System Constants
 *
 * The hug system provides consistent spacing and sizing throughout the editor.
 * All components heights, positioning, and grid calculations are based on this unit.
 */

// Core hug system constant - change this value to adjust the entire system
export const HUG_HEIGHT = 32; // 1 hug = 32px

// Derived constants
export const MIN_HUGS = 1; // Minimum component height in hugs
export const MAX_GRID_ROWS = 50; // Maximum rows for positioning
export const GRID_COLS = 2; // Number of columns

// Utility functions
export function pixelsToHugs(pixels: number): number {
	return Math.max(MIN_HUGS, Math.ceil(pixels / HUG_HEIGHT));
}

export function hugsToPixels(hugs: number): number {
	return hugs * HUG_HEIGHT;
}

export function snapToHugBoundary(pixels: number): number {
	return Math.round(pixels / HUG_HEIGHT) * HUG_HEIGHT;
}
