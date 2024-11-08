import { SiGithub, SiKofi } from "@icons-pack/react-simple-icons";

export function Footer(): JSX.Element {
  return (
    <footer className="mt-8 py-4 text-center text-[#6B5C45] border-t border-[#B3955D]">
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col items-center gap-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Pax Dei Clan Directory
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/juddisjudd/paxdeiclans"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#B3955D] hover:text-[#8C714A] transition-colors"
          >
            <SiGithub className="h-4 w-4" />
            <span className="text-sm">Open Source</span>
          </a>
          <span className="text-[#B3955D]/30">•</span>
          <a
            href="https://ko-fi.com/ohitsjudd"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#B3955D] hover:text-[#8C714A] transition-colors"
          >
            <SiKofi className="h-4 w-4" />
            <span className="text-sm">Support</span>
          </a>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex max-w-6xl mx-auto px-4 items-center justify-between">
        <p>&copy; {new Date().getFullYear()} Pax Dei Clan Directory</p>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/juddisjudd/paxdeiclans"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#B3955D] hover:text-[#8C714A] transition-colors"
          >
            <SiGithub className="h-4 w-4" />
            Open Source
          </a>
          <span className="text-[#B3955D]/30">|</span>
          <a
            href="https://ko-fi.com/ohitsjudd"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#B3955D] hover:text-[#8C714A] transition-colors"
          >
            <SiKofi className="h-4 w-4" />
            Show Support
          </a>
        </div>
      </div>
    </footer>
  );
}
