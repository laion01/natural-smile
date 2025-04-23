import { useState, useRef, FormEvent } from "react";
import { Snippet } from "@heroui/snippet";
import { button as buttonStyles } from "@heroui/theme";

import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBoxClick = () => {
    inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleBoxClick();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSourceImage(file);
      setPreviewSrc(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!sourceImage) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", sourceImage);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.url) {
        setResultImage(data.url);
      } else {
        alert(data.error || "Image generation failed");
      }
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-6 py-8 md:py-10">
        <div className="inline-block max-w-xl text-center justify-center">
          <span className={title()}>Biovoxel&nbsp;</span>
          <span className={title({ color: "violet" })}>Face Smile&nbsp;</span>
          <br />
          <span className={title()}>Transformation</span>
          <div className={subtitle({ class: "mt-4" })}>
            Upload an image and generate a beautiful result.
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center mt-6">
          <div className="flex flex-col items-center">
            <label htmlFor="source-upload" className="font-semibold mb-2">
              Source Image
            </label>

            <input
              id="source-upload"
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              className="w-64 h-64 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-xl shadow-md cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
              onClick={handleBoxClick}
              onKeyDown={handleKeyDown}
              role="button"
              tabIndex={0}
            >
              {previewSrc ? (
                <img
                  alt="Preview"
                  className="w-full h-full object-cover rounded-xl"
                  src={previewSrc}
                />
              ) : (
                <span className="text-gray-400">Click to upload image</span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <label htmlFor="generated-result" className="font-semibold mb-2">
              Generated Image
            </label>

            {loading ? (
              <div className="w-64 h-64 flex items-center justify-center text-sm border rounded-xl">
                Generating...
              </div>
            ) : resultImage ? (
              <img
                alt="Result"
                className="w-64 h-64 object-cover rounded-xl shadow-md"
                id="generated-result"
                src={resultImage}
              />
            ) : (
              <div className="w-64 h-64 border rounded-xl flex items-center justify-center text-gray-400">
                No result yet
              </div>
            )}
          </div>
        </div>

        <button
          className={buttonStyles({
            class: "mt-4 px-6 py-2",
            color: "primary",
            radius: "full",
            variant: "shadow",
          })}
          disabled={!sourceImage || loading}
          onClick={handleSubmit}
        >
          {loading ? "Processing..." : "Generate Image"}
        </button>

        <div className="mt-8">
          <Snippet hideCopyButton hideSymbol variant="bordered">
            <span>Get started by editing Prompt</span>
          </Snippet>
        </div>
      </section>
    </DefaultLayout>
  );
}
