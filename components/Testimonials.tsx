import { TestimonialV2, type TestimonialColumnData } from "@/components/ui/testimonial-v2";
import { TESTIMONIAL_COLUMNS } from "@/lib/constants";

/**
 * Column layout for the testimonial marquee: every column scrolls at a
 * slightly different speed so the wall of cards never looks locked together.
 * Column 2 only appears from `md` up and column 3 from `lg` up, which keeps
 * the mobile view to a single readable column.
 */
const TESTIMONIAL_COLUMN_LAYOUT: TestimonialColumnData[] = [
  { testimonials: TESTIMONIAL_COLUMNS[0], duration: 15 },
  { testimonials: TESTIMONIAL_COLUMNS[1], duration: 19, className: "hidden md:block" },
  { testimonials: TESTIMONIAL_COLUMNS[2], duration: 17, className: "hidden lg:block" },
];

export function Testimonials() {
  return (
    <TestimonialV2
      columns={TESTIMONIAL_COLUMN_LAYOUT}
      badge="Testimonials"
      title="What our users say"
      description="Discover how thousands of teams turn everyday photos into campaign-ready visuals."
    />
  );
}

export default Testimonials;

