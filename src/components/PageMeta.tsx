import { useEffect } from "react";

interface PageMetaProps {
  title: string;
  description?: string;
}

export default function PageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    document.title = `${title} | Blog Auto-École`;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute("content", description);
      }
    }
  }, [title, description]);

  return null;
}
