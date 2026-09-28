import { Link } from "react-router-dom";

// Raster reference, direction 10. This is not a newly drawn vector master.
export default function BrandMark() {
  return <Link to="/" className="site-brand" aria-label="WEBEDRIVE — accueil">
    <img src="/brand/webedrive.png" width="280" height="65" alt="WEBEDRIVE — Auto-école" decoding="async" />
  </Link>;
}
