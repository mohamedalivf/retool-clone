/**
 * Preview store for managing components in read-only preview mode
 * Receives components from the edit store and provides them for preview rendering
 */

import type { ComponentState } from "@/modules/edit/store/types";
import { create } from "zustand";

// ============================================================================
// STORE TYPES
// ============================================================================

interface PreviewStoreState {
	components: ComponentState[];
	isLoading: boolean;
}

interface PreviewStoreActions {
	// Component management
	setComponents: (components: ComponentState[]) => void;
	clearComponents: () => void;

	// Utility actions
	getComponentById: (id: string) => ComponentState | undefined;
}

type PreviewStoreType = PreviewStoreState & PreviewStoreActions;

// ============================================================================
// STORE CREATION
// ============================================================================

export const usePreviewStore = create<PreviewStoreType>((set, get) => ({
	// Initial state
	components: [],
	isLoading: false,

	// Actions
	setComponents: (components: ComponentState[]) => {
		set({
			components: [...components], // Create a copy to avoid mutations
			isLoading: false,
		});
	},

	clearComponents: () => {
		set({
			components: [],
			isLoading: false,
		});
	},

	getComponentById: (id: string) => {
		return get().components.find((c) => c.id === id);
	},
}));

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to get all components for preview
 */
export const usePreviewComponents = () => {
	return usePreviewStore((state) => state.components);
};

/**
 * Hook to check if preview is loading
 */
export const usePreviewLoading = () => {
	return usePreviewStore((state) => state.isLoading);
};
