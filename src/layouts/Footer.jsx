import React from "react";
// Ensure you have a logo.png in your 'public' folder
const LOGO_PATH = "/logo.png";

const Footer = () => {
  return (
    <footer className="w-full bg-[#1c1b19] relative z-10 mt-auto block font-sans">
      {/* White strip above footer */}
      <div className="h-5 w-full bg-white" />

      {/* Main Footer Container */}
      <div className="relative mx-auto px-5 pt-14 pb-12 text-center text-white md:px-10 lg:pt-14 lg:pb-12">
        {/* Logo Circle - Overlapping Top */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-7 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#f5ebf5] shadow-md z-10">
          <img
            src={LOGO_PATH}
            alt="Logo"
            className="h-[60px] w-[60px] object-contain"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML =
                '<span class="text-2xl">💎</span>';
            }}
          />
        </div>

        {/* Brand Title */}
        <h2 className="mt-4 text-[23px] font-normal tracking-[2px] text-white">
          ARRA JEWELS
        </h2>

        {/* Top Divider */}
        <div className="my-7 h-px w-full bg-white/10" />

        {/* Columns Container */}
        {/* Mobile: Grid (2 cols), Tablet: Grid (3 cols), Desktop: Flex (Space Between) */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 text-left md:grid-cols-3 lg:flex lg:justify-between lg:gap-10 lg:px-10">
          {/* Column 1 */}
          <div className="flex flex-col">
            <h4 className="mb-3.5 text-xl font-normal text-white">About</h4>
            <FooterLink>Who we are</FooterLink>
            <FooterLink>Our mission</FooterLink>
            <FooterLink>Review</FooterLink>
            <FooterLink>Press</FooterLink>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col lg:mr-9">
            <h4 className="mb-3.5 text-xl font-normal text-white">Learn</h4>
            <FooterLink>4C’s of diamond</FooterLink>
            <FooterLink>Crown Diamond Guide</FooterLink>
            <FooterLink>Grown Gemstone Guide</FooterLink>
            <FooterLink>Find your ring size</FooterLink>
            <FooterLink>Guide</FooterLink>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col">
            <h4 className="mb-3.5 text-xl font-normal text-white">Care</h4>
            <FooterLink>Returns</FooterLink>
            <FooterLink>Shipping</FooterLink>
            <FooterLink>Lifetime guarantee</FooterLink>
            <FooterLink>Ring resizing</FooterLink>
            <FooterLink>FAQ’s</FooterLink>
            <FooterLink>Accessibility</FooterLink>
          </div>

          {/* Column 4 */}
          <div className="flex flex-col">
            <h4 className="mb-3.5 text-xl font-normal text-white">Category</h4>
            <FooterLink>Engagement Rings</FooterLink>
            <FooterLink>Wedding Rings</FooterLink>
            <FooterLink>Earrings</FooterLink>
            <FooterLink>Bracelet</FooterLink>
            <FooterLink>Pendants</FooterLink>
          </div>

          {/* Column 5 */}
          <div className="flex flex-col">
            <h4 className="mb-3.5 text-xl font-normal text-white">Connect</h4>
            <FooterLink>Live chat</FooterLink>
            <FooterLink>contact@arra.com</FooterLink>
            <FooterLink>+1-224-806-6786</FooterLink>
            <FooterLink>Shop place</FooterLink>
          </div>

          {/* Column 6 */}
          <div className="flex flex-col">
            <h4 className="mb-3.5 text-xl font-normal text-white">Socials</h4>
            <FooterLink>Instagram</FooterLink>
            <FooterLink>Facebook</FooterLink>
            <FooterLink>Twitter</FooterLink>
            <FooterLink>Whatsapp</FooterLink>
          </div>
        </div>

        {/* Bottom Divider */}
        <div className="mt-8 mb-4 h-px w-full bg-white/10" />

        {/* Copyright */}
        <div className="text-center text-[13px] text-white/60">
          Copy Rights 2025@ All Rights Reserved
        </div>
      </div>
    </footer>
  );
};

// Helper component for links to keep code clean
const FooterLink = ({ children }) => (
  <p className="my-1.5 text-[17px] text-white/70 transition-colors hover:text-[#ae6eae] cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis">
    {children}
  </p>
);

export default Footer;
