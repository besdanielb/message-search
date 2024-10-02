import { Skeleton } from "@mui/material";
import './read-skeleton.scss';

export default function ReadSkeleton() {
	// Define how many skeleton lines you want
	const skeletonLines = Array.from({ length: 10 }, (_, index) => index + 1);

	return (
		<ul>
			{skeletonLines.map((line) => (
				<li key={line} className="skeleton-item">
					<div className="skeleton-content">
						<Skeleton variant="text" width="100%" height={24} />
						<Skeleton variant="text" width="100%" height={24} />
						<Skeleton variant="text" width="100%" height={24} />
						<Skeleton variant="text" width="100%" height={24} />
					</div>
					
				</li>
			))}
		</ul>
	);
};