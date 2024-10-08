import Skeleton from "@mui/material/Skeleton";
import "./loader.scss";

export default function LoadingSkeleton() {
  return (
    <div className="loader noHover">
      <ul>
        <li>
          <span style={{ display: "inline-flex", alignItems: "center" }}>
            <Skeleton
              animation="wave"
              width="24px"
              height="24px"
              variant="circular"
              style={{ marginRight: "5px", backgroundColor: "var(--disabled-color)" }}
            />
            <Skeleton animation="wave" width="70%" height="30px" sx={{ backgroundColor: "var(--disabled-color)"}} />
          </span>
          <Skeleton
            animation="wave"
            width="10%"
            height="8px"
            style={{ marginTop: "10px",  backgroundColor: "var(--disabled-color)" }}
          />
          <Skeleton animation="wave" width="100%" height="100%" sx={{backgroundColor: "var(--disabled-color)"}}/>
        </li>
        <li>
          <span style={{ display: "inline-flex", alignItems: "center" }}>
            <Skeleton
              animation="wave"
              width="24px"
              height="24px"
              variant="circular"
              style={{ marginRight: "5px",  backgroundColor: "var(--disabled-color)" }}
            />
            <Skeleton animation="wave" width="70%" height="30px" sx={{ backgroundColor: "var(--disabled-color)"}} />
          </span>
          <Skeleton
            animation="wave"
            width="10%"
            height="8px"
            style={{ marginTop: "10px",  backgroundColor: "var(--disabled-color)" }}
          />
          <Skeleton animation="wave" width="100%" height="100%" sx={{ backgroundColor: "var(--disabled-color)"}} />
        </li>
        <li>
          <span style={{ display: "inline-flex", alignItems: "center" }}>
            <Skeleton
              animation="wave"
              width="24px"
              height="24px"
              variant="circular"
              style={{ marginRight: "5px",  backgroundColor: "var(--disabled-color)" }}
            />
            <Skeleton animation="wave" width="70%" height="30px" sx={{ backgroundColor: "var(--disabled-color)"}} />
          </span>
          <Skeleton
            animation="wave"
            width="10%"
            height="8px"
            style={{ marginTop: "10px",  backgroundColor: "var(--disabled-color)" }}
          />
          <Skeleton animation="wave" width="100%" height="100%"  sx={{ backgroundColor: "var(--disabled-color)"}} />
        </li>
      </ul>
    </div>
  );
}
