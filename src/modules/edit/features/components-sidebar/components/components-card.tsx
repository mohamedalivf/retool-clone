import { Card, CardContent } from "@/components/ui/card";

interface ComponentsCardProps {
	name: string;
	icon: React.ReactNode;
}

export default function ComponentsCard({ name, icon }: ComponentsCardProps) {
	return (
		<Card>
			<CardContent className="flex flex-col gap-2 items-center justify-center">
				<h5>{name}</h5>
				{icon}
			</CardContent>
		</Card>
	);
}
