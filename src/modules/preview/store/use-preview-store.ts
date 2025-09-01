


import type { ComponentState } from "@/modules/edit/store/types";
import { create } from "zustand";





interface PreviewStoreState {
	components: ComponentState[];
	isLoading: boolean;
}

interface PreviewStoreActions {

	setComponents: (components: ComponentState[]) => void;
	clearComponents: () => void;


	getComponentById: (id: string) => ComponentState | undefined;
}

type PreviewStoreType = PreviewStoreState & PreviewStoreActions;





export const usePreviewStore = create<PreviewStoreType>((set, get) => ({

	components: [],
	isLoading: false,


	setComponents: (components: ComponentState[]) => {
		set({
			components: [...components],
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







export const usePreviewComponents = () => {
	return usePreviewStore((state) => state.components);
};



export const usePreviewLoading = () => {
	return usePreviewStore((state) => state.isLoading);
};
