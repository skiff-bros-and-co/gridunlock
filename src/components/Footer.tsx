import { memo } from "react";

function FooterInternal() {
  return <div className="footer">© 2022, Ben Skiff and David Skiff</div>;
}

export const Footer = memo(FooterInternal);
