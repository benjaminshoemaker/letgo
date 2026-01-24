import { compressImage } from "@/lib/image-compression";

// Mock browser-image-compression
const mockImageCompression = jest.fn();
jest.mock("browser-image-compression", () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockImageCompression(...args),
}));

describe("image-compression", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("compresses large images with correct options", async () => {
    const inputFile = new File(["test-content"], "photo.png", {
      type: "image/png",
    });
    const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
    mockImageCompression.mockResolvedValue(compressedBlob);

    const result = await compressImage(inputFile);

    expect(mockImageCompression).toHaveBeenCalledWith(inputFile, {
      maxWidthOrHeight: 1200,
      initialQuality: 0.8,
      fileType: "image/jpeg",
      useWebWorker: true,
    });
    expect(result).toBeInstanceOf(File);
    expect(result.type).toBe("image/jpeg");
  });

  it("respects max dimension setting", async () => {
    const inputFile = new File(["test-content"], "large-image.jpg", {
      type: "image/jpeg",
    });
    const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
    mockImageCompression.mockResolvedValue(compressedBlob);

    await compressImage(inputFile);

    expect(mockImageCompression).toHaveBeenCalledWith(
      inputFile,
      expect.objectContaining({
        maxWidthOrHeight: 1200,
      })
    );
  });

  it("handles different input formats (PNG)", async () => {
    const inputFile = new File(["test-content"], "image.png", {
      type: "image/png",
    });
    const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
    mockImageCompression.mockResolvedValue(compressedBlob);

    const result = await compressImage(inputFile);

    // Output should always be JPEG
    expect(result.type).toBe("image/jpeg");
    expect(result.name).toBe("image.jpg");
  });

  it("handles different input formats (WebP)", async () => {
    const inputFile = new File(["test-content"], "photo.webp", {
      type: "image/webp",
    });
    const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
    mockImageCompression.mockResolvedValue(compressedBlob);

    const result = await compressImage(inputFile);

    expect(result.type).toBe("image/jpeg");
    expect(result.name).toBe("photo.jpg");
  });

  it("converts filename to .jpg extension", async () => {
    const inputFile = new File(["test-content"], "my-photo.PNG", {
      type: "image/png",
    });
    const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
    mockImageCompression.mockResolvedValue(compressedBlob);

    const result = await compressImage(inputFile);

    expect(result.name).toBe("my-photo.jpg");
  });
});
