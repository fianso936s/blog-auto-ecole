import { Navigate, useLocation } from "react-router-dom";
export default function LegacyBlogRedirect() {
  const { pathname, search, hash } = useLocation();
  return <Navigate replace to={`/blog${pathname}${search}${hash}`} />;
}
