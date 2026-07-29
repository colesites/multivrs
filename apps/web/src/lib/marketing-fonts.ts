import localFont from "next/font/local";

export const acari = localFont({
  src: [
    { path: "../../public/fonts/AcariSans-Regular.otf", weight: "400" },
    { path: "../../public/fonts/AcariSans-Medium.otf", weight: "500" },
    { path: "../../public/fonts/AcariSans-Bold.otf", weight: "700" },
    { path: "../../public/fonts/AcariSans-ExtraBold.otf", weight: "800" },
  ],
  variable: "--font-acari",
});

export const clashDisplay = localFont({
  src: [
    { path: "../../public/fonts/ClashDisplay-Regular.otf", weight: "400" },
    { path: "../../public/fonts/ClashDisplay-Medium.otf", weight: "500" },
    { path: "../../public/fonts/ClashDisplay-Bold.otf", weight: "700" },
  ],
  variable: "--font-clash",
});
