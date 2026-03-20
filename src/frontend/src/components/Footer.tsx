import { Leaf, Mail, MapPin, Phone } from "lucide-react";

const FOOTER_COLS = [
  { title: "Company", links: ["About", "Careers", "Blog"] },
  { title: "Product", links: ["Features", "Pricing", "Changelog"] },
  { title: "Resources", links: ["Docs", "Support", "Community"] },
  { title: "Legal", links: ["Privacy", "Terms", "Cookie Policy"] },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">Farminder</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Smart fertilizer reminders for modern farmers.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="font-medium">Owner:</span> Rajveer Rohan Mane
            </p>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-sm mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {l}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {/* Contact Column */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:9623777107"
                  className="flex items-start gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  <span>9623777107</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:rajveermane172@gmail.com"
                  className="flex items-start gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  <span>rajveermane172@gmail.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  <span>Raigad Bunglow, Ganesh Nagar Nagthane, Sangli</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            &copy; {year}. Built with ❤️ using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
