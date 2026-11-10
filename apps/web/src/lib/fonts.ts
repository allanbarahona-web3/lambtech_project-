import { Instrument_Sans } from "next/font/google";

export const instrumentSans = Instrument_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-instrument-sans",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});
