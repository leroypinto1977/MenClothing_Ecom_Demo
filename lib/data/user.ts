import type { User } from "@/lib/types";

export const currentUser: User = {
  name: "James Whitfield",
  firstName: "James",
  email: "james.whitfield@example.com",
  memberSince: "2023-09-01",
  addresses: [
    {
      id: "addr-1",
      label: "Home",
      name: "James Whitfield",
      line1: "18 Marylebone Lane",
      line2: "Flat 4",
      city: "London",
      region: "Greater London",
      postal: "W1U 2NB",
      country: "United Kingdom",
      default: true,
    },
    {
      id: "addr-2",
      label: "Office",
      name: "James Whitfield",
      line1: "42 Charlotte Street",
      city: "London",
      region: "Greater London",
      postal: "W1T 2NP",
      country: "United Kingdom",
      default: false,
    },
  ],
};
