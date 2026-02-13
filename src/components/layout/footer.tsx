import Link from "next/link";
import { Container } from "./container";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-8">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-semibold text-foreground">
              Ani<span className="text-primary">Notes</span>
            </span>
            . All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/rss.xml" className="hover:text-foreground transition-colors">
              RSS
            </Link>
            <Link href="/sitemap.xml" className="hover:text-foreground transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
