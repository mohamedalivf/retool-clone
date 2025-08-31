import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function PreviewHeaderFeature() {
	const navigate = useNavigate();

	const handleBackToEdit = () => {
		navigate({ to: "/" });
	};

	return (
		<header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex h-full items-center justify-between px-4">
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleBackToEdit}
						className="gap-2"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Edit
					</Button>
					<div className="h-4 w-px bg-border" />
					<h1 className="text-sm font-medium text-muted-foreground">
						Preview Mode
					</h1>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-xs text-muted-foreground">
						Read-only preview
					</span>
				</div>
			</div>
		</header>
	);
}
