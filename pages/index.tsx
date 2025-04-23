import { useState, useRef, FormEvent } from "react";
import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = () => setPreviewSrc(reader.result as string);
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handleBoxClick = () => {
    inputRef.current?.click();
  };

  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    formData.append('image', sourceImage);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.url) {
        setResultImage(data.url);
      } else {
        alert(data.error || 'Image generation failed');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-6 py-8 md:py-10">
        <div className="inline-block max-w-xl text-center justify-center">
          <span className={title()}>Biovoxel&nbsp;</span>
          <span className={title({ color: "violet" })}> Face Smile &nbsp;</span>
          <br />
          <span className={title()}>Transformation</span>
          <div className={subtitle({ class: "mt-4" })}>
            Upload an image and generate a beautiful result.
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center mt-6">
          <div className="flex flex-col items-center">
            <label className="font-semibold mb-2">Source Image</label>

            {/* Source Image */}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={handleBoxClick}
              className="w-64 h-64 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-xl shadow-md cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
            >
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="text-gray-400">Click to upload image</span>
              )}
            </div>
          </div>

          {/* Result Image */}
          <div className="flex flex-col items-center">
            <label className="font-semibold mb-2">Generated Image</label>
            {loading ? (
              <div className="w-64 h-64 flex items-center justify-center text-sm border rounded-xl">
                Generating...
              </div>
            ) : resultImage ? (
              <img
                src={resultImage}
                alt="Result"
                className="w-64 h-64 object-cover rounded-xl shadow-md"
              />
            ) : (
              <div className="w-64 h-64 border rounded-xl flex items-center justify-center text-gray-400">
                No result yet
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className={buttonStyles({
            color: "primary",
            radius: "full",
            variant: "shadow",
            class: "mt-4 px-6 py-2",
          })}
          disabled={!sourceImage || loading}
        >
          {loading ? "Processing..." : "Generate Image"}
        </button>

        <div className="mt-8">
          <Snippet hideCopyButton hideSymbol variant="bordered">
            <span>
              Get started by editing Prompt
            </span>
          </Snippet>
        </div>
      </section>
    </DefaultLayout >
  );
}
