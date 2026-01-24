import { render, screen, fireEvent } from "@testing-library/react";
import { ConditionSelector } from "@/components/scan/condition-selector";

describe("ConditionSelector", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all condition options", () => {
    render(<ConditionSelector value={null} onChange={mockOnChange} />);

    expect(screen.getByText("Excellent")).toBeInTheDocument();
    expect(screen.getByText("Good")).toBeInTheDocument();
    expect(screen.getByText("Fair")).toBeInTheDocument();
    expect(screen.getByText("Poor")).toBeInTheDocument();
  });

  it("displays help text for each option", () => {
    render(<ConditionSelector value={null} onChange={mockOnChange} />);

    expect(screen.getByText("Like new, no visible wear.")).toBeInTheDocument();
    expect(screen.getByText("Works well, minor cosmetic wear.")).toBeInTheDocument();
    expect(screen.getByText("Noticeable wear or missing parts, still usable.")).toBeInTheDocument();
    expect(screen.getByText("Not functional or heavily damaged.")).toBeInTheDocument();
  });

  it("handles selection correctly", () => {
    render(<ConditionSelector value={null} onChange={mockOnChange} />);

    fireEvent.click(screen.getByText("Good"));

    expect(mockOnChange).toHaveBeenCalledWith("GOOD");
  });

  it("shows selected state for current value", () => {
    const { container } = render(
      <ConditionSelector value="EXCELLENT" onChange={mockOnChange} />
    );

    // The selected button should have the border-primary class
    const buttons = container.querySelectorAll("button");
    const excellentButton = Array.from(buttons).find((btn) =>
      btn.textContent?.includes("Excellent")
    );

    expect(excellentButton).toHaveClass("border-primary");
  });
});
