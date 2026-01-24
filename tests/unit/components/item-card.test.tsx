import { render, screen } from "@testing-library/react";
import { ItemCard } from "@/components/items/item-card";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt} src={props.src} />
  ),
}));

describe("ItemCard", () => {
  const baseItem = {
    id: "item-123",
    photoUrl: "https://example.com/photo.jpg",
    identifiedName: "Vintage Lamp",
    recommendation: "SELL" as const,
    status: "TODO" as const,
  };

  it("renders item data correctly", () => {
    render(<ItemCard item={baseItem} />);

    expect(screen.getByText("Vintage Lamp")).toBeInTheDocument();
    expect(screen.getByText("SELL")).toBeInTheDocument();
    expect(screen.getByText("To do")).toBeInTheDocument();
  });

  it("displays correct status labels", () => {
    const statuses = [
      { status: "TODO" as const, label: "To do" },
      { status: "SOLD" as const, label: "Sold" },
      { status: "DONATED" as const, label: "Donated" },
      { status: "RECYCLED" as const, label: "Recycled" },
      { status: "TRASHED" as const, label: "Trashed" },
    ];

    for (const { status, label } of statuses) {
      const { unmount } = render(
        <ItemCard item={{ ...baseItem, status }} />
      );
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });

  it("displays correct recommendation badges", () => {
    const recommendations = ["SELL", "DONATE", "RECYCLE", "DISPOSE"] as const;

    for (const recommendation of recommendations) {
      const { unmount } = render(
        <ItemCard item={{ ...baseItem, recommendation }} />
      );
      expect(screen.getByText(recommendation)).toBeInTheDocument();
      unmount();
    }
  });

  it("links to item detail page", () => {
    render(<ItemCard item={baseItem} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/items/item-123");
  });

  it("renders item image", () => {
    render(<ItemCard item={baseItem} />);

    const image = screen.getByAltText("Vintage Lamp");
    expect(image).toHaveAttribute("src", "https://example.com/photo.jpg");
  });
});
